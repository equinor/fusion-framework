import type { AppModules, AppModulesInstance } from '@equinor/fusion-framework-app';
import { AnyModule, ModuleKey, ModuleType, ModuleTypes } from '@equinor/fusion-framework-module';
import { useAppModules } from './useAppModules';

/**
 * hook for getting a module from the application scope
 *
 * @template TType type of the module
 *
 * @param module name of the module, provide TType if not registered
 *
 * @returns provider of the module
 */
export const useAppModule = <
    TType extends AnyModule | unknown = unknown,
    TKey extends string = ModuleKey<ModuleTypes<AppModules<[TType]>>>,
>(
    module: TKey,
): TType extends AnyModule
    ? ModuleType<TType>
    : AppModulesInstance[Extract<keyof AppModulesInstance, TKey>] => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const appModule = useAppModules()[module];
    if (!appModule) {
        throw Error(`the requested module [${module}] is not included in the app scope`);
    }
    return appModule;
};

export default useAppModule;
