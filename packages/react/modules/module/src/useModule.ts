import type { AnyModule, ModuleKey, Modules, ModuleType } from '@equinor/fusion-framework-module';

import { useModules } from './useModules.js';

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
