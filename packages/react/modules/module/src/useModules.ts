import type {
  AnyModule,
  ModuleKey,
  Modules,
  ModulesInstanceType,
  ModuleType,
} from '@equinor/fusion-framework-module';
import { useContext } from 'react';

import { moduleContext } from './context.js';

/**
 * Hook for accessing module instances from the current context scope.
 *
 * Retrieves initialized module instances that were provided via a `ModuleProvider`.
 * The hook supports both array and object-based module collections, with full type safety.
 *
 * @template TModules - The type of modules to retrieve. Can be an array of modules or a record/object mapping module names to module types. Defaults to all available `Modules`.
 * @returns An object containing the initialized module instances, with types inferred from the provided module definitions.
 *
 * @example
 * ```ts
 * // Using with a specific module object
 * const modules = useModules<{ navigation: NavigationModule }>();
 * const navigation = modules.navigation;
 *
 * // Using with default modules
 * const allModules = useModules();
 * ```
 */
export const useModules = <
  TModules extends Array<AnyModule> | Record<string, AnyModule> = Modules,
>(): ModulesInstanceType<TModules> => useContext(moduleContext) as ModulesInstanceType<TModules>;

/**
 * Hook for accessing a single module instance from the current context scope.
 *
 * Convenience hook that retrieves a single module by its key/name. This is useful
 * when you only need one module and want to avoid destructuring from `useModules`.
 *
 * @template T - The type of the module to retrieve. Defaults to any module from the available `Modules`.
 * @template TKey - The string key/name of the module. Automatically inferred from `T` when possible.
 * @param key - The name/key of the module to retrieve from the context.
 * @returns The initialized instance of the requested module, with proper type inference.
 *
 * @example
 * ```ts
 * // Get a specific module by name
 * const navigation = useModule('navigation');
 *
 * // With explicit type
 * const navigation = useModule<NavigationModule>('navigation');
 * ```
 */
export const useModule = <
  T extends AnyModule = Modules[keyof Modules],
  TKey extends string = ModuleKey<T>,
>(
  key: TKey,
): ModuleType<TKey extends keyof Modules ? Modules[TKey] : T> => {
  const modules = useModules<Record<string, AnyModule>>();
  return (modules as Record<string, unknown>)[key] as ModuleType<
    TKey extends keyof Modules ? Modules[TKey] : T
  >;
};

export default useModules;
