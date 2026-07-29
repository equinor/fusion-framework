import type { DemoModuleConfig } from './configurator';

/**
 * Exposes resolved demo module configuration values to consumers.
 */
export class DemoProvider {
  #config: DemoModuleConfig;

  /**
   * Creates a provider backed by resolved demo module configuration.
   * @param config - Resolved configuration for the demo module.
   */
  constructor(config: DemoModuleConfig) {
    this.#config = config;
  }

  /**
   * Returns the required foo configuration value.
   * @returns The required foo configuration value.
   */
  get foo(): string {
    return this.#config.foo;
  }

  /**
   * Returns the optional bar configuration value.
   * @returns The optional bar configuration value, or `undefined` if not set.
   */
  get bar(): number | undefined {
    return this.#config.bar;
  }
}

export default DemoProvider;
