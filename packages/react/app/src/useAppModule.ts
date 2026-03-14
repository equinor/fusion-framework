import type { AppModules, AppModulesInstance } from '@equinor/fusion-framework-app';
import type {
  AnyModule,
  ModuleKey,
  ModuleType,
  ModuleTypes,
} from '@equinor/fusion-framework-module';

import { useAppModules } from './useAppModules';

/**
 * React hook that retrieves a single module instance from the application scope.
 *
 * @template TType - The concrete module type (e.g. `ContextModule`). Pass
 *   `unknown` to infer the type from the key.
 * @template TKey - The string key used to look up the module.
 * @param module - The key identifying the module to retrieve.
 * @returns The resolved module instance.
 * @throws If the requested module is not registered in the application scope.
 *
 * @example
 * ```tsx
 * const auth = useAppModule('auth');
 * auth.acquireAccessToken().then(console.log);
 * ```
 */
export function useAppModule<
  TType extends AnyModule | unknown = unknown,
  TKey extends string = ModuleKey<ModuleTypes<AppModules<[TType]>>>,
>(
  module: TKey,
): TType extends AnyModule
  ? ModuleType<TType>
  : AppModulesInstance[Extract<keyof AppModulesInstance, TKey>] {
  const appModule = useAppModules()[module as keyof AppModulesInstance];
  if (!appModule) {
    throw Error(`the requested module [${module}] is not included in the app scope`);
  }
  return appModule as TType extends AnyModule
    ? ModuleType<TType>
    : AppModulesInstance[Extract<keyof AppModulesInstance, TKey>];
}

export default useAppModule;
