import { BaseConfigBuilder, type ConfigBuilderCallback } from '@equinor/fusion-framework-module';

export type DemoModuleConfig = { foo: string; bar?: number };

/**
 * Builds configuration for the demo module before its provider is created.
 */
export class DemoModuleConfigurator extends BaseConfigBuilder<DemoModuleConfig> {
  /**
   * Registers the callback that resolves the demo module's foo value.
   * @param cb - Callback used to resolve the foo configuration value.
   */
  public setFoo(cb: ConfigBuilderCallback<string>) {
    this._set('foo', cb);
  }

  /**
   * Registers the callback that resolves the demo module's bar value.
   * @param cb - Callback used to resolve the optional bar configuration value.
   */
  public setBar(cb: ConfigBuilderCallback<number>) {
    this._set('bar', cb);
  }

  /**
   * Completes demo configuration and supplies a delayed fallback bar value.
   * @param config - Partially resolved demo module configuration.
   * @returns Complete configuration for the demo module.
   */
  protected async _processConfig(config: Partial<DemoModuleConfig>) {
    // Delay the fallback to demonstrate asynchronous module configuration.
    if (!config.bar) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      config.bar = 5;
    }
    return config as DemoModuleConfig;
  }
}

export default DemoModuleConfig;
