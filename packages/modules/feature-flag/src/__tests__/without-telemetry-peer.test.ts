import { afterEach, describe, expect, it, vi } from 'vitest';

// Simulates consumers that omit the optional telemetry peer: resolving it fails.
vi.mock('@equinor/fusion-framework-module-telemetry', () => {
  throw new Error('Cannot find package @equinor/fusion-framework-module-telemetry');
});
vi.mock('@equinor/fusion-framework-module-telemetry/utils', () => {
  throw new Error('Cannot find package @equinor/fusion-framework-module-telemetry');
});

afterEach(() => vi.restoreAllMocks());

describe('feature-flag module without the optional telemetry peer', () => {
  it('loads its entry point, because telemetry is only imported when a provider connects', async () => {
    await expect(import('../index.js')).resolves.toBeDefined();
  });

  it('stays uninstrumented and warns once when telemetry is offered but cannot load', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { FeatureFlagProvider } = await import('../FeatureFlagProvider.js');
    const provider = new FeatureFlagProvider({ config: { initial: [], plugins: [] } });
    const track = vi.fn();

    await provider.connectTelemetry({ source: { hostId: 'host' }, track } as never);
    await provider.connectTelemetry({ source: { hostId: 'host' }, track } as never);

    provider.dispose();
    expect(track).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      'Operational telemetry for feature-flag: telemetry package unavailable',
    );
  });
});
