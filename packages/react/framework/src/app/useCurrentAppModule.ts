import { AppModules, AppModulesInstance } from '@equinor/fusion-framework-module-app';
import {
    ModuleKey,
    type AnyModule,
    ModuleTypes,
    ModuleType,
} from '@equinor/fusion-framework-module';
import useCurrentAppModules from './useCurrentAppModules';

/**
 * Retrieves the current app module based on the provided module key.
 * @template TType - The type of the module.
 * @template TKey - The type of the module key.
 * @param {TKey} moduleKey - The key of the module to retrieve.
 * @returns {AnyModule | null | undefined} - The current app module or null if not found.
 * @remarks
 *  - when module is null, there are no current selected application
 *  - when undefined is, the application has not enabled the requested module
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
            : // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (modules[moduleKey as keyof typeof modules] as any);
    return { module, error, complete };
};

export default useCurrentAppModule;
