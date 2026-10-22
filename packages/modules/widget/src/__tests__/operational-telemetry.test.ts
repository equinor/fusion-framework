import { afterEach, describe, expect, it, vi } from 'vitest';
import { asyncScheduler, identity, lastValueFrom, observeOn, Subject, switchMap } from 'rxjs';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import {
  enableTelemetry,
  type ITelemetryProvider,
  type TelemetryItem,
  type TelemetryModule,
} from '@equinor/fusion-framework-module-telemetry';

import { WidgetModuleProvider } from '../WidgetModuleProvider.js';
import { WidgetManifestLoadError } from '../WidgetManifestLoadError.js';
import { createOperationalTelemetry } from '@equinor/fusion-framework-module-telemetry/utils';
import { measureStage } from '../integrations/measure-stage.js';
import widgetModule from '../module.js';
import type { IClient, WidgetManifest } from '../types.js';

const SENTINEL = 'sentinel-secret';

afterEach(() => vi.restoreAllMocks());

const manifest = (name: string): WidgetManifest =>
  ({
    id: SENTINEL,
    name,
    version: '2.0.1',
    description: SENTINEL,
    entryPoint: `index.js?token=${SENTINEL}`,
  }) as WidgetManifest;

const createClient = (getManifest: (args: { widgetKey: string }) => Promise<unknown>): IClient => ({
  apiVersion: '1.0',
  baseImportUrl: 'https://widgets.example.com',
  getWidgetManifest: { client: { fn: getManifest }, key: (args) => JSON.stringify(args) },
  getWidgetConfig: {
    client: { fn: async () => ({ environment: { secret: SENTINEL } }) },
    key: (args) => JSON.stringify(args),
  },
});

/** Real host telemetry with an explicit adapter, observed at the exported record boundary. */
const createTelemetry = async () => {
  const config = new ModulesConfigurator();
  const processItem = vi.fn<(item: TelemetryItem) => void>();
  enableTelemetry(config, {
    configure: (builder) => {
      builder.setSource({ source: 'framework', hostId: 'host' });
      builder.setAdapter('test', { initialize: vi.fn(), processItem });
    },
  });
  const modules = await config.initialize<[TelemetryModule]>();
  const records = () =>
    processItem.mock.calls
      .map(([item]) => item)
      .filter((item) => item.diagnostic?.module === 'widget');
  return { modules, processItem, records };
};

const summary = (items: TelemetryItem[]) =>
  items.map((item) => [item.name, item.diagnostic?.outcome, item.properties?.reason]);

describe('widget load-stage telemetry', () => {
  it('connects a widget created before its provider receives a telemetry scope', async () => {
    const { modules, records } = await createTelemetry();
    const provider = new WidgetModuleProvider({
      config: { client: createClient(async ({ widgetKey }) => manifest(widgetKey)) },
    });
    const widget = provider.getWidget('late-widget');
    await provider.connectTelemetry(modules.telemetry);
    await lastValueFrom(widget.getManifest());
    expect(records()).toHaveLength(1);
    expect(records()[0]).toMatchObject({
      name: 'fusion.widget.load-manifest.duration',
      properties: { widgetKey: 'late-widget', widgetVersion: '2.0.1' },
    });
    widget.dispose();
    provider.dispose();
    await modules.dispose();
  });

  it('records manifest and config stages with static identity only', async () => {
    const { modules, records, processItem } = await createTelemetry();
    const provider = new WidgetModuleProvider({
      config: { client: createClient(async ({ widgetKey }) => manifest(widgetKey)) },
    });
    await provider.connectTelemetry(modules.telemetry);
    const widget = provider.getWidget('my-widget');
    await lastValueFrom(widget.getManifest());
    await lastValueFrom(widget.getConfig());

    expect(summary(records())).toEqual([
      ['fusion.widget.load-manifest.duration', 'success', undefined],
      ['fusion.widget.load-config.duration', 'success', undefined],
    ]);
    expect(records()[0].properties).toEqual({ widgetKey: 'my-widget', widgetVersion: '2.0.1' });
    expect(JSON.stringify(processItem.mock.calls)).not.toContain(SENTINEL);
    widget.dispose();
    provider.dispose();
    await modules.dispose();
  });

  it('classifies a manifest failure and preserves the error for the caller', async () => {
    // The manifest flow logs failures itself; that existing behavior is not under test.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { modules, records, processItem } = await createTelemetry();
    const original = new WidgetManifestLoadError('not_found', SENTINEL);
    const provider = new WidgetModuleProvider({
      config: {
        client: createClient(async () => {
          throw original;
        }),
      },
    });
    await provider.connectTelemetry(modules.telemetry);
    const widget = provider.getWidget('my-widget');
    await expect(lastValueFrom(widget.getManifest())).rejects.toThrow();
    // The reason mirrors the classified error the caller receives; the provider maps
    // non-HTTP client errors on this path to `unknown`.
    expect(summary(records())).toEqual([
      ['fusion.widget.load-manifest.duration', 'failure', 'unknown'],
      ['fusion.widget.load-manifest.failure', 'failure', 'unknown'],
    ]);
    expect(JSON.stringify(processItem.mock.calls)).not.toContain(SENTINEL);
    widget.dispose();
    provider.dispose();
    await modules.dispose();
  });

  it('cancels a superseded manifest request and keeps the latest failure outcome', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const pending: Array<{
      resolve: (value: WidgetManifest) => void;
      reject: (error: unknown) => void;
    }> = [];
    const client = createClient(
      () =>
        new Promise<WidgetManifest>((resolve, reject) => {
          pending.push({ resolve, reject });
        }),
    );
    const { modules, records } = await createTelemetry();
    const provider = new WidgetModuleProvider({ config: { client } });
    await provider.connectTelemetry(modules.telemetry);
    const widget = provider.getWidget('my-widget');
    widget.loadManifest();
    await vi.waitFor(() => expect(pending).toHaveLength(1));

    pending[0].resolve(manifest('my-widget'));
    await Promise.resolve();
    await Promise.resolve();
    widget.loadManifest();
    await vi.waitFor(() => expect(pending).toHaveLength(2));
    pending[1].reject(new Error(SENTINEL));

    await vi.waitFor(() =>
      expect(summary(records())).toEqual([
        ['fusion.widget.load-manifest.duration', 'cancelled', 'superseded'],
        ['fusion.widget.load-manifest.duration', 'failure', 'unknown'],
        ['fusion.widget.load-manifest.failure', 'failure', 'unknown'],
      ]),
    );
    widget.dispose();
    provider.dispose();
    await modules.dispose();
  });

  it('keeps each outcome with its own request when delivery is queued behind a newer one', async () => {
    const { modules, records } = await createTelemetry();
    const telemetry = createOperationalTelemetry('widget');
    telemetry.connect(modules.telemetry);
    type StageAction = { type: string; payload?: unknown };
    const outcomes = {
      success: { match: (action: StageAction) => action.type === 'fetch_manifest::success' },
      failure: { match: (action: StageAction) => action.type === 'fetch_manifest::failure' },
    };
    // Mirrors a FlowSubject flow: switchMap per request, delivery on the async scheduler.
    const requests = new Subject<Subject<StageAction>>();
    const delivered: string[] = [];
    const subscription = requests
      .pipe(
        switchMap((request) => request.pipe(measureStage(telemetry, 'load-manifest', outcomes))),
        observeOn(asyncScheduler),
      )
      .subscribe((action) => delivered.push(action.type));
    const [first, second, third] = [
      new Subject<StageAction>(),
      new Subject<StageAction>(),
      new Subject<StageAction>(),
    ];

    requests.next(first);
    // Emitted but not yet delivered when the next request replaces it.
    first.next({ type: 'fetch_manifest::success' });
    requests.next(second);
    // Replaced before producing any outcome.
    requests.next(third);
    third.next({ type: 'fetch_manifest::failure', payload: { type: 'unknown' } });

    await vi.waitFor(() => expect(delivered).toHaveLength(2));
    expect(summary(records())).toEqual([
      ['fusion.widget.load-manifest.duration', 'success', undefined],
      ['fusion.widget.load-manifest.duration', 'cancelled', 'superseded'],
      ['fusion.widget.load-manifest.duration', 'failure', 'unknown'],
      ['fusion.widget.load-manifest.failure', 'failure', 'unknown'],
    ]);
    // Absent telemetry adds no operator at all.
    expect(measureStage(undefined, 'load-manifest', outcomes)).toBe(identity);
    subscription.unsubscribe();
    telemetry.close();
    await modules.dispose();
  });

  it('cancels in-flight stages on disposal and emits nothing afterwards', async () => {
    const { modules, records } = await createTelemetry();
    let resolve!: (value: WidgetManifest) => void;
    const provider = new WidgetModuleProvider({
      config: {
        client: createClient(
          () =>
            new Promise((res) => {
              resolve = res;
            }),
        ),
      },
    });
    await provider.connectTelemetry(modules.telemetry);
    const widget = provider.getWidget('my-widget');
    widget.loadManifest();
    await vi.waitFor(() => expect(resolve).toBeDefined());
    widget.dispose();
    expect(summary(records())).toEqual([
      ['fusion.widget.load-manifest.duration', 'cancelled', 'unloaded'],
    ]);
    resolve(manifest('my-widget'));
    await new Promise((res) => setTimeout(res, 0));
    widget.loadManifest();
    expect(records()).toHaveLength(1);
    provider.dispose();
    await modules.dispose();
  });

  it('cancels in-flight stages when the provider is disposed and stops the widget reporting', async () => {
    const { modules, records } = await createTelemetry();
    let resolve!: (value: WidgetManifest) => void;
    const provider = new WidgetModuleProvider({
      config: {
        client: createClient(
          () =>
            new Promise((res) => {
              resolve = res;
            }),
        ),
      },
    });
    await provider.connectTelemetry(modules.telemetry);
    const widget = provider.getWidget('my-widget');
    widget.loadManifest();
    await vi.waitFor(() => expect(resolve).toBeDefined());
    provider.dispose();
    expect(summary(records())).toEqual([
      ['fusion.widget.load-manifest.duration', 'cancelled', 'disposed'],
    ]);
    expect(records()[0].properties).toMatchObject({ widgetKey: 'my-widget' });
    resolve(manifest('my-widget'));
    await new Promise((res) => setTimeout(res, 0));
    widget.loadManifest();
    expect(records()).toHaveLength(1);
    widget.dispose();
    await modules.dispose();
  });

  it('records an abandoned initialize() as cancelled', async () => {
    const { modules, records } = await createTelemetry();
    const provider = new WidgetModuleProvider({
      config: { client: createClient(() => new Promise(() => undefined)) },
    });
    await provider.connectTelemetry(modules.telemetry);
    const widget = provider.getWidget('my-widget');
    widget
      .initialize()
      .subscribe({ error: () => undefined })
      .unsubscribe();
    expect(summary(records().filter((item) => item.diagnostic?.operation === 'load'))).toEqual([
      ['fusion.widget.load.duration', 'cancelled', undefined],
    ]);
    widget.dispose();
    provider.dispose();
    await modules.dispose();
  });

  it('connects telemetry through the optional provider hook without requiring it', async () => {
    const telemetry = {} as ITelemetryProvider;
    const connectTelemetry = vi.fn();
    await widgetModule.postInitialize?.({
      instance: { connectTelemetry } as never,
      modules: { telemetry } as never,
    });
    expect(connectTelemetry).toHaveBeenCalledWith(telemetry);
    // Custom providers without the hook are left untouched.
    await expect(
      Promise.resolve(
        widgetModule.postInitialize?.({ instance: {} as never, modules: {} as never }),
      ),
    ).resolves.toBeUndefined();
  });
});
