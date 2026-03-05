import type { ConfigBuilderCallbackArgs } from '@equinor/fusion-framework-module';
import { describe, expect, it, vi } from 'vitest';
import type { IMsalClient } from '../MsalClient.interface';
import { type MsalConfig, MsalConfigurator } from '../MsalConfigurator';

const createConfigCallbackArgs = (): ConfigBuilderCallbackArgs => ({
  config: {},
  hasModule: vi.fn().mockReturnValue(false),
  requireInstance: vi.fn(),
});

const createClient = (): IMsalClient => ({}) as IMsalClient;

const createInitialConfig = (): Pick<MsalConfig, 'telemetry'> => ({
  telemetry: {
    metadata: {},
    scope: [],
  },
});

describe('MsalConfigurator', () => {
  it('setAuthCode should normalize surrounding whitespace', async () => {
    const configurator = new MsalConfigurator();

    configurator.setClient(createClient());
    configurator.setAuthCode('  auth-code  ');

    const config = await configurator.createConfigAsync(
      createConfigCallbackArgs(),
      createInitialConfig(),
    );

    expect(config.authCode).toBe('auth-code');
  });

  it('setAuthCode should allow clearing with undefined', async () => {
    const configurator = new MsalConfigurator();

    configurator.setClient(createClient());
    configurator.setAuthCode('auth-code');
    configurator.setAuthCode(undefined);

    const config = await configurator.createConfigAsync(
      createConfigCallbackArgs(),
      createInitialConfig(),
    );

    expect(config.authCode).toBeUndefined();
  });

  it('setAuthCode should treat whitespace-only values as undefined', async () => {
    const configurator = new MsalConfigurator();

    configurator.setClient(createClient());
    configurator.setAuthCode('   ');

    const config = await configurator.createConfigAsync(
      createConfigCallbackArgs(),
      createInitialConfig(),
    );

    expect(config.authCode).toBeUndefined();
  });
});
