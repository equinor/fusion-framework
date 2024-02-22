import type { AppModules, AppModulesInstance } from '@equinor/fusion-framework-app';
import type {
    AnyModule,
    ModuleKey,
    ModuleType,
    ModuleTypes,
} from '@equinor/fusion-framework-module';

import { useAppModules } from './useAppModules';

/**
 * Retrieves the specified app module from the app scope.
 *
 * @template TType - The type of the app module.
 * @template TKey - The key of the app module.
 * @param module - The key of the app module to retrieve.
 * @returns The app module instance if found, otherwise throws an error.
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
