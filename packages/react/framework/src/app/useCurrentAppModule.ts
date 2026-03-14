import type { AppModules, AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type {
  ModuleKey,
  AnyModule,
  ModuleTypes,
  ModuleType,
} from '@equinor/fusion-framework-module';
import useCurrentAppModules from './useCurrentAppModules';

/**
 * React hook that retrieves a specific module from the current application.
 *
 * @template TType - The expected module type.
 * @template TKey - The module key used for look-up.
 * @param moduleKey - The key of the module to retrieve.
 * @returns An object containing:
 *   - `module` — The resolved module instance, `null` when no app is
 *     selected, or `undefined` if the app does not enable the requested module.
 *   - `error` — Any error emitted during initialisation.
 *   - `complete` — `true` when the observable has completed.
 *
 * @remarks
 * - A `null` value means no application is currently selected.
 * - An `undefined` value means the application has not enabled the requested module.
 */
export const useCurrentAppModule = <
  TType extends AnyModule | unknown = unknown,
  TKey extends string = ModuleKey<ModuleTypes<AppModules<[TType]>>>,
>(
  moduleKey: TKey,
): {
  module?:
    | (TType extends AnyModule
        ? ModuleType<TType>
        : AppModulesInstance[Extract<keyof AppModulesInstance, TKey>])
    | null;
  error?: unknown;
  complete: boolean;
} => {
  const { modules, error, complete } = useCurrentAppModules();
  const module =
    modules === null
      ? null
      : modules === undefined
        ? undefined
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (modules[moduleKey as keyof typeof modules] as any);
  return { module, error, complete };
};

export default useCurrentAppModule;
