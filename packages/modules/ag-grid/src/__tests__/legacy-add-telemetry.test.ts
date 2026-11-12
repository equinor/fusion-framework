import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import {
  enableTelemetry,
  TelemetryLevel,
  type ITelemetryProvider,
  type TelemetryModule,
} from '@equinor/fusion-framework-module-telemetry';

import { AgGridProvider } from '../AgGridProvider.js';
import { applyThemeShim } from '../apply-theme-shim.js';
import { observeLegacyAdd } from '../observe-legacy-add.js';
import { enableAgGrid, type AgGridModule } from '../module.js';

type LegacyGrids = Map<unknown, unknown> & { add: (key: unknown) => Map<unknown, unknown> };

const SENTINEL = { secret: 'PRIVACY_SENTINEL' };

let grids: Map<unknown, unknown>;

beforeEach(() => {
  grids = new Map();
  vi.stubGlobal('window', { agStyleInjectionState: { grids } });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const createTelemetry = (trackEvent = vi.fn()) =>
  ({
    source: { source: 'app', hostId: 'host-1' },
    track: vi.fn(),
    trackEvent,
  }) as unknown as ITelemetryProvider & { trackEvent: ReturnType<typeof vi.fn> };

const legacy = (): LegacyGrids => grids as LegacyGrids;

describe('AG Grid legacy add() compatibility diagnostic', () => {
  it('keeps patched add() map semantics, with or without observers', () => {
    applyThemeShim();
    expect(legacy().add('a')).toBe(grids);

    const observer = vi.fn();
    const stop = observeLegacyAdd(observer);
    expect(legacy().add('b')).toBe(grids);
    stop();
    stop();
    legacy().add('c');

    expect([...grids.entries()]).toEqual([
      ['a', true],
      ['b', true],
      ['c', true],
    ]);
    expect(observer).toHaveBeenCalledTimes(1);
  });

  it('records invocation of the patched add(), not installation, once per host lifecycle', async () => {
    const telemetry = createTelemetry();
    const provider = new AgGridProvider({});
    await provider.connectTelemetry(telemetry);

    expect(telemetry.trackEvent).not.toHaveBeenCalled();
    for (let index = 0; index < 100; index++) legacy().add({ ...SENTINEL, index });

    expect(telemetry.trackEvent).toHaveBeenCalledTimes(1);
    const [record] = telemetry.trackEvent.mock.calls[0];
    expect(record).toEqual({
      name: 'fusion.ag-grid.legacy-add',
      level: TelemetryLevel.Warning,
      scope: ['app', 'operational'],
      diagnostic: expect.objectContaining({
        schemaVersion: 1,
        module: 'ag-grid',
        operation: 'legacy-add',
        outcome: 'success',
        hostId: 'host-1',
      }),
    });
    expect(JSON.stringify(record)).not.toContain(SENTINEL.secret);
    expect(grids.size).toBe(100);
  });

  it('bounds records to one per connected host, including another bundle patch', async () => {
    applyThemeShim();
    const portal = createTelemetry();
    const app = createTelemetry();
    // A second provider sees the already-patched add() through the global observer registry.
    await new AgGridProvider({}).connectTelemetry(portal);
    await new AgGridProvider({}).connectTelemetry(app);

    legacy().add('a');
    legacy().add('b');

    expect(portal.trackEvent).toHaveBeenCalledTimes(1);
    expect(app.trackEvent).toHaveBeenCalledTimes(1);
  });

  it('records nothing after disposal or when telemetry is disconnected', async () => {
    const disposed = createTelemetry();
    const disconnected = createTelemetry();
    const disposedWhileLoading = createTelemetry();
    const disconnectedWhileLoading = createTelemetry();
    const first = new AgGridProvider({});
    await first.connectTelemetry(disposed);
    first.dispose();
    const second = new AgGridProvider({});
    await second.connectTelemetry(disconnected);
    await second.connectTelemetry(undefined);
    // Disposal or disconnection while the reporter is still loading wins the race.
    const third = new AgGridProvider({});
    const loading = third.connectTelemetry(disposedWhileLoading);
    third.dispose();
    await loading;
    const fourth = new AgGridProvider({});
    const reconnecting = fourth.connectTelemetry(disconnectedWhileLoading);
    await fourth.connectTelemetry(undefined);
    await reconnecting;

    legacy().add('a');

    expect(disposed.trackEvent).not.toHaveBeenCalled();
    expect(disconnected.trackEvent).not.toHaveBeenCalled();
    expect(disposedWhileLoading.trackEvent).not.toHaveBeenCalled();
    expect(disconnectedWhileLoading.trackEvent).not.toHaveBeenCalled();
    expect(grids.get('a')).toBe(true);
  });

  it('preserves add() when telemetry delivery fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const failing = createTelemetry(
      vi.fn(() => {
        throw new Error(SENTINEL.secret);
      }),
    );
    await new AgGridProvider({}).connectTelemetry(failing);

    expect(legacy().add('a')).toBe(grids);

    expect(grids.get('a')).toBe(true);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(warn.mock.calls)).not.toContain(SENTINEL.secret);
  });

  it('does not patch or observe a foreign add() implementation', async () => {
    const foreignAdd = vi.fn();
    Object.assign(grids, { add: foreignAdd });
    const telemetry = createTelemetry();

    await new AgGridProvider({}).connectTelemetry(telemetry);
    legacy().add('a');

    expect(foreignAdd).toHaveBeenCalledWith('a');
    expect(telemetry.trackEvent).not.toHaveBeenCalled();
  });

  it('is a no-op outside a browser', () => {
    vi.unstubAllGlobals();
    expect(() => applyThemeShim()).not.toThrow();
    expect(() => observeLegacyAdd(vi.fn())()).not.toThrow();
  });
});

describe('AG Grid module telemetry wiring', () => {
  it('exports the diagnostic through host telemetry and stops after disposal', async () => {
    const processItem = vi.fn();
    const config = new ModulesConfigurator();
    enableTelemetry(config, {
      attachConfiguratorEvents: false,
      configure: (builder) => {
        builder.setAdapter('test', { initialize: vi.fn(), processItem });
      },
    });
    enableAgGrid(config);
    const modules = await config.initialize<[TelemetryModule, AgGridModule]>();

    legacy().add(SENTINEL);
    await vi.waitFor(() => {
      expect(processItem.mock.calls.map(([item]) => item.name)).toEqual([
        'fusion.ag-grid.legacy-add',
      ]);
    });
    expect(JSON.stringify(processItem.mock.calls)).not.toContain(SENTINEL.secret);

    await modules.dispose();
    legacy().add('after-dispose');
    expect(processItem).toHaveBeenCalledTimes(1);
  });

  it('keeps the shim working without a telemetry module', async () => {
    const config = new ModulesConfigurator();
    enableAgGrid(config);
    const modules = await config.initialize<[AgGridModule]>();

    expect(legacy().add('a')).toBe(grids);
    expect(grids.get('a')).toBe(true);

    await modules.dispose();
  });
});
