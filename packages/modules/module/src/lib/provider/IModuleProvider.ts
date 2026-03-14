import type SemanticVersion from '../semantic-version.js';

/**
 * Contract that every Fusion Framework module provider must satisfy.
 *
 * A module provider is the runtime instance returned by a module’s
 * {@link Module.initialize | initialize} method. It exposes the module’s
 * public API to consumers and participates in the framework’s lifecycle
 * through {@link dispose}.
 *
 * @remarks
 * Prefer extending {@link BaseModuleProvider} instead of implementing this
 * interface directly, as the base class manages subscriptions and version
 * parsing automatically.
 *
 * @see BaseModuleProvider
 */
export interface IModuleProvider {
  /** Semantic version of the module provider, used for compatibility checks. */
  get version(): SemanticVersion;

  /** Tears down the provider and releases all held resources. */
  dispose: VoidFunction;
}
