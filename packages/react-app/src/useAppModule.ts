import type { AppModules, AppModulesInstance } from '@equinor/fusion-framework-app';
import { AnyModule, ModuleKey, ModuleType, ModuleTypes } from '@equinor/fusion-framework-module';
import { useAppModules } from './useAppModules';

export const useAppModule = <
    TType extends AnyModule | unknown = unknown,
    TKey extends string = ModuleKey<ModuleTypes<AppModules<[TType]>>>
>(
    module: TKey
): TType extends AnyModule
    ? ModuleType<TType>
    : AppModulesInstance[Extract<keyof AppModulesInstance, TKey>] =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    useAppModules()[module];

export default useAppModule;
