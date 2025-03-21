import SemanticVersion from '../semantic-version';

import type { IModuleProvider } from './IModuleProvider';

import { Subscription, type TeardownLogic } from 'rxjs';

export type BaseModuleProviderCtorArgs<TConfig = unknown> = {
  version: string | SemanticVersion;
  config: TConfig;
};

/**
 * Base class for creating module provider
 *
 * this is the interface which is returned after enabling a module
 */
export abstract class BaseModuleProvider<TConfig = unknown> implements IModuleProvider {
  #version: SemanticVersion;
  #subscriptions: Subscription;

  public get version() {
    return this.#version;
  }

  constructor(args: BaseModuleProviderCtorArgs<TConfig>) {
    const { version } = args;
    this.#version = new SemanticVersion(version);
    this.#subscriptions = new Subscription();
  }

  /**
   * Add teardown down function, which is called on dispose.
   *
   * @param teardown dispose callback function
   * @returns callback for removing the teardown
   */
  protected _addTeardown(teardown: Exclude<TeardownLogic, void>): VoidFunction {
    this.#subscriptions.add(teardown);
    return () => this.#subscriptions.remove(teardown);
  }

  public dispose() {
    this.#subscriptions.unsubscribe();
  }
}
