import type { AppModulesInstance } from '@equinor/fusion-framework-app';
import { useAppModules } from './useAppModules';

export const useAppModule = <TKey extends keyof AppModulesInstance>(
    module: TKey
): AppModulesInstance[TKey] => useAppModules()[module];

export default useAppModule;
