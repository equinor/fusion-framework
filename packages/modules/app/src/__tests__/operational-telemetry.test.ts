import { afterEach, describe, expect, it, vi } from 'vitest';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import {
  enableTelemetry,
  type TelemetryItem,
  type TelemetryModule,
} from '@equinor/fusion-framework-module-telemetry';

import eventModule from '@equinor/fusion-framework-module-event';

import { enableAppModule } from '../enable-app-module';
import type { AppModule } from '../module';
import type { IAppClient } from '../AppClient';
import { AppManifestError } from '../errors';
import type { AppManifest } from '../types';
import { AppModuleProvider } from '../AppModuleProvider.js';

const SENTINEL = 'sentinel-secret';

afterEach(() => vi.restoreAllMocks());

/** Resolves a promise that the test settles explicitly, to observe in-flight stages. */
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const manifest = (appKey: string): AppManifest =>
  ({
    appKey,
    displayName: `https://example.com/${SENTINEL}`,
    build: { version: '1.2.3', entryPoint: `index.js?token=${SENTINEL}` },
  }) as unknown as AppManifest;

const createClient = (overrides: Partial<IAppClient> = {}): IAppClient =>
  ({
    getAppManifest: async ({ appKey }: { appKey: string }) => manifest(appKey),
    getAppManifests: async () => [],
    getAppBuild: async () => ({}),
    getAppConfig: async () => ({ environment: { secret: SENTINEL } }),
    getAppSettings: async () => ({ secret: SENTINEL }),
    updateAppSettings: async ({ settings }: { settings: unknown }) => settings,
    ...overrides,
  }) as unknown as IAppClient;

/**
 * Boots a framework-shaped host with real telemetry and an explicit adapter, so records are
 * observed at the exported boundary rather than at an internal mock.
 */
const setup = async (client: IAppClient, withTelemetry = true) => {
  const config = new ModulesConfigurator();
  const processItem = vi.fn<(item: TelemetryItem) => void>();
  config.addConfig({ module: eventModule });
  if (withTelemetry) {
    enableTelemetry(config, {
      configure: (builder) => {
        builder.setSource({ source: 'framework', hostId: 'host' });
        builder.setAdapter('test', { initialize: vi.fn(), processItem });
      },
    });
  }
  enableAppModule(config, (builder) => {
    builder.setClient(async () => client);
    builder.setAssetUri('/assets');
  });
  const modules = await config.initialize<[TelemetryModule, AppModule]>();
  /** Bundle-stage records only; module lifecycle records use `initialize`/`dispose`. */
  const records = () =>
    processItem.mock.calls
      .map(([item]) => item)
      .filter(
        (item) =>
          item.diagnostic?.module === 'app' &&
          !['initialize', 'dispose'].includes(item.diagnostic.operation),
      );
  return { modules, processItem, records };
};

/** Narrows the current app without non-null assertions; tests fail clearly when it is absent. */
const required = <T>(value: T | null | undefined): T => {
  if (value === null || value === undefined) {
    throw new Error('expected a current app');
  }
  return value;
};

const summary = (items: TelemetryItem[]) =>
  items.map((item) => [item.name, item.diagnostic?.outcome, item.properties?.reason]);

describe('app load-stage telemetry', () => {
  it('connects an app created before its provider receives a telemetry scope', async () => {
    const { modules, records } = await setup(createClient());
    const provider = new AppModuleProvider({
      config: { client: createClient(), assetUri: '/assets' },
    });
    provider.setCurrentApp('late-app');
    const app = required(provider.current);
    await provider.connectTelemetry(modules.telemetry);
    await app.getManifestAsync();
    await vi.waitFor(() => expect(records()).toHaveLength(1));
    expect(records()[0]).toMatchObject({
      name: 'fusion.app.load-manifest.duration',
      properties: { appKey: 'late-app', appVersion: '1.2.3' },
    });
    provider.dispose();
    await modules.dispose();
  });

  it('records each load stage once with static app identity and no payload data', async () => {
    const { modules, records, processItem } = await setup(createClient());
    modules.app.setCurrentApp('my-app');
    const app = modules.app.current;
    await app?.getManifestAsync();
    await app?.getConfigAsync();
    await app?.getSettingsAsync();
    // The cached value resolves the caller before the store's terminal success action.
    await vi.waitFor(() => expect(records()).toHaveLength(3));

    expect(summary(records())).toEqual([
      ['fusion.app.load-manifest.duration', 'success', undefined],
      ['fusion.app.load-config.duration', 'success', undefined],
      ['fusion.app.load-settings.duration', 'success', undefined],
    ]);
    for (const item of records()) {
      expect(item.diagnostic).toMatchObject({ source: 'framework', unit: 'ms' });
      expect(item.properties).toEqual({ appKey: 'my-app', appVersion: '1.2.3' });
      expect((item as unknown as { value: number }).value).toBeGreaterThanOrEqual(0);
    }
    expect(JSON.stringify(processItem.mock.calls)).not.toContain(SENTINEL);
    await modules.dispose();
  });

  it('reports a classified failure without the original error and rejects unchanged', async () => {
    const original = new AppManifestError('not_found', `missing ${SENTINEL}`);
    const { modules, records, processItem } = await setup(
      createClient({
        getAppManifest: async () => {
          throw original;
        },
      }),
    );
    modules.app.setCurrentApp('my-app');
    const app = modules.app.current;
    await expect(app?.getManifestAsync()).rejects.toThrow();
    expect(app?.state.status).toBeDefined();

    expect(summary(records())).toEqual([
      ['fusion.app.load-manifest.duration', 'failure', 'not-found'],
      ['fusion.app.load-manifest.failure', 'failure', 'not-found'],
    ]);
    expect(JSON.stringify(processItem.mock.calls)).not.toContain(SENTINEL);
    await modules.dispose();
  });

  it('keeps a queued outcome attached to its originating manifest request', async () => {
    const pending = [deferred<AppManifest>(), deferred<AppManifest>()];
    let call = 0;
    const { modules, records } = await setup(
      createClient({ getAppManifest: () => pending[call++].promise }),
    );
    modules.app.setCurrentApp('my-app');
    const app = required(modules.app.current);
    app.loadManifest();
    await vi.waitFor(() => expect(call).toBe(1));

    pending[0].resolve(manifest('my-app'));
    await Promise.resolve();
    await Promise.resolve();
    app.loadManifest();
    await vi.waitFor(() => expect(call).toBe(2));
    pending[1].reject(new Error(SENTINEL));

    await vi.waitFor(() =>
      expect(summary(records())).toEqual([
        ['fusion.app.load-manifest.duration', 'success', undefined],
        ['fusion.app.load-manifest.duration', 'failure', 'error'],
        ['fusion.app.load-manifest.failure', 'failure', 'error'],
      ]),
    );
    await modules.dispose();
  });

  it('marks superseded and unloaded stages as cancelled, then stops after replacement', async () => {
    const pending = [deferred<AppManifest>(), deferred<AppManifest>()];
    let call = 0;
    const { modules, records } = await setup(
      createClient({ getAppManifest: () => pending[call++].promise }),
    );
    modules.app.setCurrentApp('first-app');
    const first = modules.app.current;
    first?.loadManifest();
    // A second request replaces the first through the store's switchMap flow.
    first?.loadManifest();
    await vi.waitFor(() =>
      expect(summary(records())).toContainEqual([
        'fusion.app.load-manifest.duration',
        'cancelled',
        'superseded',
      ]),
    );
    modules.app.setCurrentApp('second-app');

    expect(summary(records())).toEqual([
      ['fusion.app.load-manifest.duration', 'cancelled', 'superseded'],
      ['fusion.app.load-manifest.duration', 'cancelled', 'unloaded'],
      ['fusion.app.unload.duration', 'success', undefined],
    ]);
    expect(records().every((item) => item.properties?.appKey === 'first-app')).toBe(true);
    const count = records().length;

    // Settling the old app's request and using it after replacement emits nothing more.
    pending[1].resolve(manifest('first-app'));
    await Promise.resolve();
    first?.loadManifest();
    first?.dispose();
    expect(records()).toHaveLength(count);
    await modules.dispose();
  });

  it('keeps a bounded record count across repeated replacement', async () => {
    const { modules, records } = await setup(createClient());
    for (let index = 0; index < 5; index++) {
      modules.app.setCurrentApp(`app-${index}`);
      await modules.app.current?.getManifestAsync();
    }
    modules.app.clearCurrentApp();
    const names = summary(records()).map(([name]) => name);
    // One manifest stage per app and one unload per replaced app; nothing accumulates.
    expect(names.filter((name) => name === 'fusion.app.load-manifest.duration')).toHaveLength(5);
    expect(names.filter((name) => name === 'fusion.app.unload.duration')).toHaveLength(5);
    await modules.dispose();
  });

  it('records the import stage and the terminal load outcome when the bundle cannot load', async () => {
    const { modules, records, processItem } = await setup(createClient());
    modules.app.setCurrentApp('my-app');
    await expect(lastValueFrom(required(modules.app.current).initialize())).rejects.toBeDefined();
    await vi.waitFor(() =>
      expect(records().filter((item) => item.diagnostic?.operation === 'load')).toHaveLength(2),
    );
    const stages = summary(
      records().filter((item) => ['import', 'load'].includes(String(item.diagnostic?.operation))),
    );
    // `initialize()` requests the script twice; the store's switchMap supersedes the first.
    expect(stages).toEqual([
      ['fusion.app.import.duration', 'cancelled', 'superseded'],
      ['fusion.app.import.duration', 'failure', 'error'],
      ['fusion.app.import.failure', 'failure', 'error'],
      // The load outcome is the caller's result; stage records carry the classified reason.
      ['fusion.app.load.duration', 'failure', undefined],
      ['fusion.app.load.failure', 'failure', undefined],
    ]);
    // The entry point carries a token, which must not leak through the import failure.
    expect(JSON.stringify(processItem.mock.calls)).not.toContain(SENTINEL);
    await modules.dispose();
  });

  it('records an abandoned initialize() as cancelled without settling a later attempt', async () => {
    const pending = deferred<AppManifest>();
    let call = 0;
    const { modules, records } = await setup(
      createClient({
        getAppManifest: async ({ appKey }: { appKey: string }) =>
          call++ === 0 ? pending.promise : manifest(appKey),
      }),
    );
    modules.app.setCurrentApp('my-app');
    const app = required(modules.app.current);
    app
      .initialize()
      .subscribe({ error: () => undefined })
      .unsubscribe();
    await expect(lastValueFrom(app.initialize())).rejects.toBeDefined();
    await vi.waitFor(() =>
      expect(records().filter((item) => item.name === 'fusion.app.load.duration')).toHaveLength(2),
    );
    expect(summary(records().filter((item) => item.name === 'fusion.app.load.duration'))).toEqual([
      ['fusion.app.load.duration', 'cancelled', undefined],
      ['fusion.app.load.duration', 'failure', undefined],
    ]);
    pending.resolve(manifest('my-app'));
    await modules.dispose();
  });

  it('records a synchronous teardown failure as a failed unload and rethrows it', async () => {
    const { modules, records } = await setup(createClient());
    modules.app.setCurrentApp('my-app');
    const app = required(modules.app.current);
    const original = new Error(SENTINEL);
    await modules.event.dispatchEvent('onAppModulesLoaded', {
      detail: {
        appKey: 'my-app',
        manifest: manifest('my-app'),
        modules: {
          dispose: () => {
            throw original;
          },
        } as never,
      },
    });

    expect(() => app.dispose()).toThrow(original);
    expect(summary(records())).toEqual([
      ['fusion.app.unload.duration', 'failure', undefined],
      ['fusion.app.unload.failure', 'failure', undefined],
    ]);
    // The closed scope reports nothing more.
    app.loadManifest();
    expect(records()).toHaveLength(2);
    await modules.dispose();
  });

  it('closes load reporting immediately while an asynchronous unload remains pending', async () => {
    const { modules, records } = await setup(createClient());
    const teardown = deferred<void>();
    modules.app.setCurrentApp('my-app');
    const app = required(modules.app.current);
    await modules.event.dispatchEvent('onAppModulesLoaded', {
      detail: {
        appKey: 'my-app',
        manifest: manifest('my-app'),
        modules: { dispose: () => teardown.promise } as never,
      },
    });
    app.dispose();
    const late = app.initialize().subscribe({ error: () => undefined });
    expect(records()).toHaveLength(0);
    teardown.resolve();
    await vi.waitFor(() =>
      expect(summary(records())).toEqual([['fusion.app.unload.duration', 'success', undefined]]),
    );
    late.unsubscribe();
    app.dispose();
    expect(records()).toHaveLength(1);
    await modules.dispose();
  });

  it('cancels in-flight stages when the provider is disposed, before telemetry shuts down', async () => {
    const pending = deferred<AppManifest>();
    const { modules, records } = await setup(
      createClient({ getAppManifest: () => pending.promise }),
    );
    modules.app.setCurrentApp('my-app');
    required(modules.app.current).loadManifest();
    await modules.dispose();
    expect(summary(records())).toEqual([
      ['fusion.app.load-manifest.duration', 'cancelled', 'disposed'],
    ]);
    expect(records()[0].properties).toMatchObject({ appKey: 'my-app' });
    pending.resolve(manifest('my-app'));
    await Promise.resolve();
    expect(records()).toHaveLength(1);
  });

  it('records a failed update as a failure while the caller still receives its error', async () => {
    const { modules, records } = await setup(
      createClient({
        updateAppSettings: async () => {
          throw new Error(SENTINEL);
        },
      }),
    );
    modules.app.setCurrentApp('my-app');
    await expect(
      lastValueFrom(required(modules.app.current).updateSettings({ value: SENTINEL })),
    ).rejects.toThrow('failed to update application settings');
    const update = summary(records()).filter(([name]) => String(name).includes('update'));
    expect(update).toEqual([
      ['fusion.app.update-settings.duration', 'failure', 'error'],
      ['fusion.app.update-settings.failure', 'failure', 'error'],
    ]);
    await modules.dispose();
  });

  it('keeps loading unchanged when telemetry is absent or throws', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const absent = await setup(createClient(), false);
    absent.modules.app.setCurrentApp('my-app');
    await expect(absent.modules.app.current?.getManifestAsync()).resolves.toMatchObject({
      appKey: 'my-app',
    });
    expect(warn).not.toHaveBeenCalled();
    await absent.modules.dispose();

    const failing = await setup(createClient());
    await failing.modules.app.connectTelemetry({
      source: { source: 'framework', hostId: 'host' },
      track: () => {
        throw new Error('collector down');
      },
    } as never);
    failing.modules.app.setCurrentApp('my-app');
    const app = failing.modules.app.current;
    await expect(app?.getManifestAsync()).resolves.toMatchObject({ appKey: 'my-app' });
    await expect(firstValueFrom(required(app).getConfig())).resolves.toBeDefined();
    // Repeated delivery failures are reported once, never thrown into business code.
    expect(warn).toHaveBeenCalledTimes(1);
    await failing.modules.dispose();
  });
});
