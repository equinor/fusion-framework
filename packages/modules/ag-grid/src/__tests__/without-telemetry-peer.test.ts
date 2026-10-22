import { afterEach, describe, expect, it, vi } from 'vitest';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';

// Simulates consumers that omit the optional telemetry peer: resolving it fails.
vi.mock('@equinor/fusion-framework-module-telemetry', () => {
  throw new Error('Cannot find package @equinor/fusion-framework-module-telemetry');
});
vi.mock('@equinor/fusion-framework-module-telemetry/utils', () => {
  throw new Error('Cannot find package @equinor/fusion-framework-module-telemetry');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('AG Grid without the optional telemetry peer', () => {
  it('loads, initializes and keeps the legacy add() shim working', async () => {
    const grids = new Map<unknown, unknown>();
    vi.stubGlobal('window', { agStyleInjectionState: { grids } });
    const { enableAgGrid } = await import('../module.js');
    const config = new ModulesConfigurator();
    enableAgGrid(config);

    const modules = await config.initialize();
    const add = (grids as Map<unknown, unknown> & { add: (key: unknown) => unknown }).add;

    expect(add('a')).toBe(grids);
    expect(grids.get('a')).toBe(true);
    await modules.dispose();
  });

  it('stays functional when telemetry is offered but its package cannot load', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const grids = new Map<unknown, unknown>();
    vi.stubGlobal('window', { agStyleInjectionState: { grids } });
    const { AgGridProvider } = await import('../AgGridProvider.js');
    const provider = new AgGridProvider({});
    const trackEvent = vi.fn();

    // Only the members the diagnostic would use are faked; the reporter never loads.
    await provider.connectTelemetry({ trackEvent } as never);
    (grids as Map<unknown, unknown> & { add: (key: unknown) => unknown }).add('a');

    expect(grids.get('a')).toBe(true);
    expect(trackEvent).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith('AG Grid compatibility telemetry is unavailable');
  });
});
