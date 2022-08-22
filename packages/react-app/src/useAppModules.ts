import type { AppModulesInstance } from '@equinor/fusion-framework-app';
import { useModules } from '@equinor/fusion-framework-react-module';

export const useAppModules = useModules<AppModulesInstance>;

export default useAppModules;
