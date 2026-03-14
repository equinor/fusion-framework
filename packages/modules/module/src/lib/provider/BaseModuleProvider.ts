import { coerce } from 'semver';
import { Subscription, type TeardownLogic } from 'rxjs';

import SemanticVersion from '../semantic-version.js';

import type { IModuleProvider } from './IModuleProvider.js';

/**
 * Constructor arguments accepted by {@link BaseModuleProvider}.
 *
 * @template TConfig - The resolved configuration type for the module.
 */
export type BaseModuleProviderCtorArgs<TConfig = unknown> = {
  /** Semantic version string or instance identifying this provider release. */
  version: string | SemanticVersion;

  /** The fully-resolved configuration object produced during the configure phase. */
  config: TConfig;
};

/**
 * Abstract base class for Fusion Framework module providers.
 *
 * Extend `BaseModuleProvider` to create the runtime instance that a module’s
 * {@link Module.initialize | initialize} method returns. The base class
 * handles version parsing, subscription lifecycle management, and duck-typed
 * `instanceof` checks.
 *
 * Subclasses should register teardown callbacks via {@link _addTeardown} so
 * that resources (subscriptions, timers, event listeners) are automatically
 * cleaned up when the framework calls {@link dispose}.
 *
 * @template TConfig - The resolved configuration type for the module.
 *
 * @example
 * ```typescript
 * class MyProvider extends BaseModuleProvider<MyConfig> {
 *   constructor(args: BaseModuleProviderCtorArgs<MyConfig>) {
 *     super(args);
 *     const sub = someObservable$.subscribe();
 *     this._addTeardown(sub);
 *   }
 * }
 * ```
 *
 * @see IModuleProvider
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
      const obj = instance as Record<string, unknown>;
      const version = coerce(String(obj.version));
      const dispose = obj.dispose;
      return !!version && typeof dispose === 'function';
    }
    return false;
  }

  #version: SemanticVersion;
  #subscriptions: Subscription;

  public get version() {
    return this.#version;
  }

  /**
   * Creates a new module provider.
   *
   * @param args - Version and resolved configuration for the module.
   */
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

  /**
   * Unsubscribes all registered teardowns and releases held resources.
   *
   * Called automatically by the framework during module disposal.
   */
  public dispose() {
    this.#subscriptions.unsubscribe();
  }
}
