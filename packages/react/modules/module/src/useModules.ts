import type { AnyModule, Modules, ModulesInstanceType } from '@equinor/fusion-framework-module';
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


export default useModules;
