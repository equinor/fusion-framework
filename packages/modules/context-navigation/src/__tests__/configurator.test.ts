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
    expect(config.enableTelemetry).toBe(false);
    expect(config.warnOnCustomStrategy).toBe(false);
    expect(config.onCustomStrategyDetected).toBeUndefined();
  });

  it('setConsoleDebug enables debug', async () => {
    const configurator = new ContextNavigationConfigurator();
    configurator.setConsoleDebug(true);
    const config = await configurator.createConfigAsync(INIT);
    expect(config.consoleDebug).toBe(true);
  });

  it('enableTelemetry enables telemetry', async () => {
    const configurator = new ContextNavigationConfigurator();
    configurator.enableTelemetry(true);
    const config = await configurator.createConfigAsync(INIT);
    expect(config.enableTelemetry).toBe(true);
  });

  it('setWarnOnCustomStrategy enables warning', async () => {
    const configurator = new ContextNavigationConfigurator();
    configurator.setWarnOnCustomStrategy(true);
    const config = await configurator.createConfigAsync(INIT);
    expect(config.warnOnCustomStrategy).toBe(true);
  });

  it('enableAppSwitchCarryOver can be disabled', async () => {
    const configurator = new ContextNavigationConfigurator();
    configurator.enableAppSwitchCarryOver(false);
    const config = await configurator.createConfigAsync(INIT);
    expect(config.enableAppSwitchCarryOver).toBe(false);
  });

  it('setOnCustomStrategyDetected stores callback', async () => {
    const callback = () => {};
    const configurator = new ContextNavigationConfigurator();
    configurator.setOnCustomStrategyDetected(callback);
    const config = await configurator.createConfigAsync(INIT);
    expect(config.onCustomStrategyDetected).toBe(callback);
  });

  it('methods return this for chaining', () => {
    const configurator = new ContextNavigationConfigurator();
    const result = configurator
      .setConsoleDebug(true)
      .enableTelemetry(true)
      .setWarnOnCustomStrategy(true)
      .enableAppSwitchCarryOver(false);
    expect(result).toBe(configurator);
  });
});
