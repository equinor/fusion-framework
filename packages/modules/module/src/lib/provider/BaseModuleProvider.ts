import { coerce } from 'semver';
import { Subscription, type TeardownLogic } from 'rxjs';

import SemanticVersion from '../semantic-version.js';

import type { IModuleProvider } from './IModuleProvider.js';

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
  /**
   * Custom instanceof check for module providers.
   * Determines if an object is considered an instance of BaseModuleProvider
   * by validating the structure and ensuring the version is a valid SemanticVersion
   * and dispose is a function.
   *
   * @param instance - The object to check
   * @returns True if the object has valid structure and property types, false otherwise
   */
  static [Symbol.hasInstance](instance: unknown): boolean {
    const hasStructure =
      instance !== null &&
      typeof instance === 'object' &&
      // Use 'in' operator to check prototype chain, allowing for duck-typing
      // where inherited properties are acceptable for instanceof checks
      'version' in instance &&
      'dispose' in instance;
    if (hasStructure) {
      const version = coerce(String((instance as BaseModuleProvider).version));
      const dispose = (instance as BaseModuleProvider).dispose;
      return !!version && typeof dispose === 'function';
    }
    return false;
  }

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
