import type { FusionModules, FusionModulesInstance } from '@equinor/fusion-framework';
import { useFramework } from './useFramework';
import type {
  AnyModule,
  ModuleKey,
  ModuleType,
  ModuleTypes,
} from '@equinor/fusion-framework-module';

/**
 * React hook that retrieves a module from the Fusion Framework by name.
 *
 * @template TType - The expected module type (used for type-narrowing).
 * @template TKey - The module key string.
 * @param name - The registered name of the module to retrieve.
 * @returns The resolved module instance, or `undefined` if the module is
 *   not registered.
 *
 * @example
 * ```ts
 * import type { HttpModule } from '@equinor/fusion-framework-module-http';
 *
 * const http = useFrameworkModule<HttpModule>('http');
 * ```
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
