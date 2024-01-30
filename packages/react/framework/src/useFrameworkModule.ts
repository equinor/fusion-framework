import type { FusionModules, FusionModulesInstance } from '@equinor/fusion-framework';
import { useFramework } from './useFramework';
import { AnyModule, ModuleKey, ModuleType, ModuleTypes } from '@equinor/fusion-framework-module';

/**
 * Retrieves a module from the framework instance based on its name.
 *
 * @template TType - The type of the module to retrieve.
 * @template TKey - The type of the module name.
 * @param name - The name of the module to retrieve.
 * @returns The requested module from the framework instance.
 * @throws Error if the requested module is not included in the framework instance.
 */
export const useFrameworkModule = <
    TType extends AnyModule | unknown = unknown,
    TKey extends string = ModuleKey<ModuleTypes<FusionModules<[TType]>>>,
>(
    name: TKey,
): TType extends AnyModule
    ? ModuleType<TType> | undefined
    : FusionModulesInstance[Extract<keyof FusionModulesInstance, TKey>] | undefined => {
    const framework = useFramework();
    // TODO
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const module = framework.modules[name];
    if (!module) {
        console.warn(`the requested module [${module}] is not included in the framework instance`);
    }
    return module;
};
