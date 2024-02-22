import type { AppModulesInstance } from '@equinor/fusion-framework-app';
import type { AnyModule } from '@equinor/fusion-framework-module';
import { useModules } from '@equinor/fusion-framework-react-module';

/**
 * Custom hook that returns an instance of the app modules.
 *
 * @template T - The type of the app modules.
 * @returns An instance of the app modules.
 */
export const useAppModules = <
    T extends Array<AnyModule> | unknown = unknown,
>(): AppModulesInstance<T> => useModules<AppModulesInstance<T>>();

export default useAppModules;
