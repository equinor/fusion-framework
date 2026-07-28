import type { ModuleInitializerArgs } from '@equinor/fusion-framework-module';

import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';

import {
  type ISignalRConfigurator,
  SignalRModuleConfigBuilder,
  type SignalRConfig,
  type SignalRHubConfig,
  type SignalRModuleConfigBuilderCallback,
} from './SignalRModuleConfigBuilder';

/**
 * Default {@link ISignalRConfigurator} implementation.
 *
 * Collects hub registrations and builder callbacks, then produces a
 * {@link SignalRConfig} during the module initialization phase.
 */
export class SignalRConfigurator implements ISignalRConfigurator {
  #builderCallbacks: Array<SignalRModuleConfigBuilderCallback> = [];

  #hubs: Record<string, SignalRHubConfig> = {};

  /**
   * Register a named SignalR hub connection.
   *
   * @param name - Unique identifier for the hub
   * @param config - Hub connection configuration
   */
  public addHub(name: string, config: SignalRHubConfig) {
    this.#hubs[name] = config;
  }

  /**
   * Register a configuration builder callback that will run during
   * {@link SignalRConfigurator.createConfig}.
   *
   * @param cb - Callback receiving a {@link SignalRModuleConfigBuilder}
   * @template T - Type of module dependencies made available to the builder callback
   */
  public onCreateConfig<T>(cb: SignalRModuleConfigBuilderCallback<T>): void {
    this.#builderCallbacks.push(cb);
  }

  /**
   * Build the final {@link SignalRConfig} by executing all registered
   * builder callbacks and collecting hub configurations.
   *
   * Normally called during the module `initialize` phase.
   *
   * @param init - Module initializer arguments providing access to resolved dependencies
   * @returns Resolved configuration containing all registered hubs
   */
  public async createConfig(
    init: ModuleInitializerArgs<ISignalRConfigurator, [ServiceDiscoveryModule]>,
  ): Promise<SignalRConfig> {
    /** trigger all builder callbacks */
    for (const cb of this.#builderCallbacks) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const builder = new SignalRModuleConfigBuilder<[ServiceDiscoveryModule]>(init, this);
      await Promise.resolve(cb(builder));
    }

    return { hubs: this.#hubs };
  }
}
