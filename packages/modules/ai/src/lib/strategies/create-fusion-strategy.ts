import type {
  ConfigBuilderCallback,
  ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';
import type { IServiceDiscoveryProvider } from '@equinor/fusion-framework-module-service-discovery';
import type { Strategy } from './types.js';
import type { AuthProvider } from './acquire-fusion-token.js';

/**
 * Module instances required by Fusion strategy factories to resolve the AI
 * service endpoint and acquire access tokens.
 */
export interface FusionAiStrategyModules {
  /** Auth provider used to acquire bearer tokens for the AI service. */
  auth: AuthProvider;
  /** Service discovery provider used to resolve the AI service endpoint. */
  serviceDiscovery: IServiceDiscoveryProvider;
}

/**
 * Factory function signature accepted by {@link fusionAiStrategy}.
 *
 * Receives the resolved Fusion module instances and returns a fully
 * constructed {@link Strategy}.
 *
 * @template T - The concrete {@link Strategy} subtype produced by the factory.
 * @param modules - Resolved auth and service discovery module instances.
 * @returns A promise that resolves to the constructed strategy.
 */
export type FusionAiStrategyFactory<T extends Strategy = Strategy> = (
  modules: FusionAiStrategyModules,
) => Promise<T>;

/**
 * Wraps a Fusion strategy factory into a {@link ConfigBuilderCallback} that
 * resolves the required `auth` and `serviceDiscovery` modules automatically.
 *
 * During callback execution the wrapper first checks whether each module is
 * available in the current scope via `requireInstance`; if not it falls back
 * to the same-named property on the `ref` parent modules object.
 * An error is thrown if neither source can provide a required module.
 *
 * @template T - The concrete {@link Strategy} subtype produced by the factory.
 * @param factory - Strategy factory that receives the resolved module instances.
 * @returns A {@link ConfigBuilderCallback} that resolves modules and delegates
 *   to the factory.
 * @throws {Error} When the `auth` module cannot be resolved from the current
 *   scope or the `ref` parent.
 * @throws {Error} When the `serviceDiscovery` module cannot be resolved from
 *   the current scope or the `ref` parent.
 *
 * @example
 * ```typescript
 * configurator.addStrategy(fusionAiStrategy(createFusionAiEmbedStrategy));
 * ```
 */
export const fusionAiStrategy = <T extends Strategy = Strategy>(
  factory: FusionAiStrategyFactory<T>,
): ConfigBuilderCallback<T> => {
  return async (args: ConfigBuilderCallbackArgs): Promise<T> => {
    // Cast ref to the expected shape so auth/serviceDiscovery can be accessed safely.
    const ref = args.ref as
      | { auth?: AuthProvider; serviceDiscovery?: IServiceDiscoveryProvider }
      | undefined;

    // Prefer sibling modules in the current scope; fall back to ref parent modules.
    const auth = args.hasModule('auth')
      ? await args.requireInstance<AuthProvider>('auth')
      : ref?.auth;

    const serviceDiscovery = args.hasModule('serviceDiscovery')
      ? await args.requireInstance<IServiceDiscoveryProvider>('serviceDiscovery')
      : ref?.serviceDiscovery;

    if (!auth) {
      throw new Error(
        'Auth module is required to resolve AI service credentials. ' +
          'Ensure the auth module is added to the framework configuration.',
      );
    }
    if (!serviceDiscovery) {
      throw new Error(
        'Service Discovery module is required to resolve AI service endpoint. ' +
          'Ensure the service discovery module is added to the framework configuration.',
      );
    }

    return factory({ auth, serviceDiscovery });
  };
};
