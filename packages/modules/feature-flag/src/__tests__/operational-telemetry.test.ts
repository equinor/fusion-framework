import { afterEach, describe, expect, it, vi } from 'vitest';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import eventModule, { type EventModule } from '@equinor/fusion-framework-module-event';
import {
  enableTelemetry,
  type TelemetryItem,
  type TelemetryModule,
} from '@equinor/fusion-framework-module-telemetry';

import { FeatureFlagProvider } from '../FeatureFlagProvider.js';
import type { FeatureFlagConfig } from '../types.js';
import { module as featureFlagModule } from '../feature-flag-module.js';

const SENTINEL = 'sentinel-secret';

afterEach(() => vi.restoreAllMocks());

/** Real event bus and host telemetry; records are observed at the exported boundary. */
const setup = async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  vi.spyOn(console, 'debug').mockImplementation(() => undefined);
  const config = new ModulesConfigurator();
  const processItem = vi.fn<(item: TelemetryItem) => void>();
  config.addConfig({ module: eventModule });
  enableTelemetry(config, {
    configure: (builder) => {
      builder.setSource({ source: 'app', hostId: 'host' });
      builder.setAdapter('test', { initialize: vi.fn(), processItem });
    },
  });
  const modules = await config.initialize<[EventModule, TelemetryModule]>();
  const provider = new FeatureFlagProvider({
    config: {
      initial: [
        { key: `${SENTINEL}-a`, enabled: false, value: SENTINEL },
        { key: `${SENTINEL}-b`, enabled: false },
        { key: `${SENTINEL}-locked`, enabled: false, readonly: true },
      ],
      plugins: {},
    } as unknown as FeatureFlagConfig,
    event: modules.event,
  });
  await provider.connectTelemetry(modules.telemetry);
  const records = () =>
    processItem.mock.calls
      .map(([item]) => item)
      .filter((item) => item.diagnostic?.module === 'feature-flag');
  const summary = () =>
    records().map((item) => [item.name, item.diagnostic?.outcome, item.properties]);
  return { modules, provider, processItem, records, summary };
};

describe('feature-flag operational telemetry', () => {
  it('records applied, rejected and cancelled toggles as counts, never feature data', async () => {
    const { modules, provider, processItem, summary } = await setup();
    await provider.toggleFeature({ key: `${SENTINEL}-a`, enabled: true });
    await provider.toggleFeature({ key: `${SENTINEL}-locked`, enabled: true });
    await provider.toggleFeature({ key: 'unregistered', enabled: true });

    const remove = modules.event.addEventListener('onFeatureFlagToggle', (event) =>
      event.preventDefault(),
    );
    await provider.toggleFeature({ key: `${SENTINEL}-b`, enabled: true });
    remove();

    // Reads are never recorded.
    provider.hasFeature(`${SENTINEL}-a`);
    provider.getFeature(`${SENTINEL}-a`);

    expect(provider.features[`${SENTINEL}-a`].enabled).toBe(true);
    expect(provider.features[`${SENTINEL}-b`].enabled).toBe(false);
    expect(summary()).toEqual([
      [
        'fusion.feature-flag.toggle.duration',
        'success',
        { requested: 1, rejected: 0, cancelled: 0, applied: 1 },
      ],
      [
        'fusion.feature-flag.toggle.duration',
        'success',
        { requested: 1, rejected: 1, cancelled: 0, applied: 0 },
      ],
      [
        'fusion.feature-flag.toggle.duration',
        'success',
        { requested: 1, rejected: 1, cancelled: 0, applied: 0 },
      ],
      [
        'fusion.feature-flag.toggle.duration',
        'cancelled',
        { requested: 1, rejected: 0, cancelled: 1, applied: 0 },
      ],
    ]);
    expect(JSON.stringify(processItem.mock.calls)).not.toContain(SENTINEL);
    await modules.dispose();
  });

  it('records a failed toggle and preserves the original rejection', async () => {
    const { modules, provider, summary } = await setup();
    const original = new Error(SENTINEL);
    vi.spyOn(modules.event, 'dispatchEvent').mockRejectedValueOnce(original);
    await expect(provider.toggleFeature({ key: `${SENTINEL}-a`, enabled: true })).rejects.toBe(
      original,
    );
    // Without a result, only the request's own counts are known.
    expect(summary()).toEqual([
      ['fusion.feature-flag.toggle.duration', 'failure', { requested: 1, rejected: 0 }],
      ['fusion.feature-flag.toggle.failure', 'failure', { requested: 1, rejected: 0 }],
    ]);
    await modules.dispose();
  });

  it('counts a superseded pending listener before recording the latest toggle result', async () => {
    const { modules, provider, summary } = await setup();
    let releaseFirst!: VoidFunction;
    let markFirstStarted!: VoidFunction;
    const firstStarted = new Promise<void>((resolve) => {
      markFirstStarted = resolve;
    });
    const firstListener = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    modules.event.addEventListener('onFeatureFlagToggle', async (event) => {
      if (event.detail.feature.key === `${SENTINEL}-a`) {
        markFirstStarted();
        await firstListener;
        event.preventDefault();
      }
    });

    await provider.toggleFeatures([
      { key: `${SENTINEL}-a`, enabled: true },
      { key: `${SENTINEL}-b`, enabled: true },
    ]);
    await firstStarted;
    expect(summary()).toEqual([
      [
        'fusion.feature-flag.toggle.duration',
        'success',
        { requested: 2, rejected: 0, cancelled: 1, applied: 1 },
      ],
    ]);
    expect(provider.features[`${SENTINEL}-a`].enabled).toBe(false);
    expect(provider.features[`${SENTINEL}-b`].enabled).toBe(true);

    releaseFirst();
    await Promise.resolve();
    expect(provider.features[`${SENTINEL}-a`].enabled).toBe(false);
    expect(summary()).toEqual([
      [
        'fusion.feature-flag.toggle.duration',
        'success',
        { requested: 2, rejected: 0, cancelled: 1, applied: 1 },
      ],
    ]);
    await modules.dispose();
  });

  it('keeps toggling unchanged when telemetry is absent or throws', async () => {
    const { modules, provider } = await setup();
    await provider.connectTelemetry(undefined);
    await provider.toggleFeature({ key: `${SENTINEL}-a`, enabled: true });
    expect(provider.features[`${SENTINEL}-a`].enabled).toBe(true);

    await provider.connectTelemetry({
      source: { source: 'app', hostId: 'host' },
      track: () => {
        throw new Error('collector down');
      },
    } as never);
    await provider.toggleFeature({ key: `${SENTINEL}-b`, enabled: true });
    await provider.toggleFeature({ key: `${SENTINEL}-a`, enabled: false });
    expect(provider.features[`${SENTINEL}-b`].enabled).toBe(true);
    expect(provider.features[`${SENTINEL}-a`].enabled).toBe(false);
    // The delivery failure is reported once, separately from the flag warnings above.
    expect(
      vi
        .mocked(console.warn)
        .mock.calls.filter(([message]) => String(message).startsWith('Operational telemetry')),
    ).toHaveLength(1);
    await modules.dispose();
  });

  it('records a toggle pending at disposal as cancelled, then reports nothing more', async () => {
    const { modules, provider, summary } = await setup();
    let release!: VoidFunction;
    // A slow listener keeps the toggle awaiting its event.
    modules.event.addEventListener(
      'onFeatureFlagToggle',
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    const toggled = provider.toggleFeature({ key: `${SENTINEL}-a`, enabled: true });
    await vi.waitFor(() => expect(release).toBeDefined());
    provider.dispose();
    expect(summary()).toEqual([
      ['fusion.feature-flag.toggle.duration', 'cancelled', { reason: 'disposed' }],
    ]);
    release();
    await toggled;
    expect(summary()).toHaveLength(1);
    await modules.dispose();
  });

  it('disposes the provider from the module dispose hook', async () => {
    const dispose = vi.fn();
    await featureFlagModule.dispose?.({ instance: { dispose } as never, modules: {} as never });
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it('connects telemetry through the optional provider hook', async () => {
    const connectTelemetry = vi.fn();
    const telemetry = {};
    await featureFlagModule.postInitialize?.({
      instance: { connectTelemetry } as never,
      modules: { telemetry } as never,
    });
    expect(connectTelemetry).toHaveBeenCalledWith(telemetry);
  });
});
