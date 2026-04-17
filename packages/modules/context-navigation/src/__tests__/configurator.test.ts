import { describe, it, expect } from 'vitest';
import type { ConfigBuilderCallbackArgs } from '@equinor/fusion-framework-module';

import { ContextNavigationConfigurator } from '../configurator';

/** Minimal init arg for `createConfigAsync`. None of our setters reference it. */
const INIT = {} as ConfigBuilderCallbackArgs;

describe('ContextNavigationConfigurator', () => {
  it('produces correct defaults', async () => {
    const config = await new ContextNavigationConfigurator().createConfigAsync(INIT);
    expect(config.enableAppSwitchCarryOver).toBe(true);
    expect(config.consoleDebug).toBe(false);
    expect(config.warnOnStrategies).toEqual([]);
    expect(config.onStrategyDetected).toBeUndefined();
    expect(config.telemetry).toBeUndefined();
  });

  it('setConsoleDebug enables debug', async () => {
    const configurator = new ContextNavigationConfigurator();
    configurator.setConsoleDebug(true);
    const config = await configurator.createConfigAsync(INIT);
    expect(config.consoleDebug).toBe(true);
  });

  it('setTelemetry stores custom tracker', async () => {
    const tracker = { trackEvent: () => {} };
    const configurator = new ContextNavigationConfigurator();
    configurator.setTelemetry(tracker);
    const config = await configurator.createConfigAsync(INIT);
    expect(config.telemetry).toBe(tracker);
  });

  it('telemetry defaults to undefined (framework auto-detection)', async () => {
    const config = await new ContextNavigationConfigurator().createConfigAsync(INIT);
    expect(config.telemetry).toBeUndefined();
  });

  it('setWarnOnStrategies stores strategy list', async () => {
    const configurator = new ContextNavigationConfigurator();
    configurator.setWarnOnStrategies(['custom', 'legacy']);
    const config = await configurator.createConfigAsync(INIT);
    expect(config.warnOnStrategies).toEqual(['custom', 'legacy']);
  });

  it('enableAppSwitchCarryOver can be disabled', async () => {
    const configurator = new ContextNavigationConfigurator();
    configurator.enableAppSwitchCarryOver(false);
    const config = await configurator.createConfigAsync(INIT);
    expect(config.enableAppSwitchCarryOver).toBe(false);
  });

  it('setOnStrategyDetected stores callback', async () => {
    const callback = () => {};
    const configurator = new ContextNavigationConfigurator();
    configurator.setOnStrategyDetected(callback);
    const config = await configurator.createConfigAsync(INIT);
    expect(config.onStrategyDetected).toBe(callback);
  });

  it('methods return this for chaining', () => {
    const configurator = new ContextNavigationConfigurator();
    const result = configurator
      .setConsoleDebug(true)
      .setWarnOnStrategies(['custom'])
      .enableAppSwitchCarryOver(false);
    expect(result).toBe(configurator);
  });
});
