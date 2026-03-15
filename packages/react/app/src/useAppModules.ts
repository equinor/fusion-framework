import type { AppModules, AppModulesInstance } from '@equinor/fusion-framework-app';
import type { AnyModule } from '@equinor/fusion-framework-module';
import { useModules } from '@equinor/fusion-framework-react-module';

/**
 * React hook that returns the full set of initialised application-scoped modules.
 *
 * @template T - Optional array of additional module types beyond the defaults.
 * @returns The {@link AppModulesInstance} containing all registered modules.
 *
 * @example
 * ```tsx
 * const modules = useAppModules();
 * console.log(Object.keys(modules));
 * ```
 */
export const useAppModules = <
  T extends Array<AnyModule> | unknown = unknown,
>(): AppModulesInstance<T> => useModules<AppModules<T>>() as AppModulesInstance<T>;

export default useAppModules;
