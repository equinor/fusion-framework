import useAppModule from '../useAppModule';
import { INavigationProvider } from '@equinor/fusion-framework-module-navigation';

/** hook for getting the navigation provider (if enabled!) */
export const useNavigationModule = (): INavigationProvider => useAppModule('navigation');
