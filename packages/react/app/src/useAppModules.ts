import type { AppModulesInstance } from '@equinor/fusion-framework-app';
import type { AnyModule } from '@equinor/fusion-framework-module';
import { useModules } from '@equinor/fusion-framework-react-module';

export const useAppModules = <
    T extends Array<AnyModule> | unknown = unknown,
>(): AppModulesInstance<T> => useModules<AppModulesInstance<T>>();

export default useAppModules;
