import useAppModule from '../useAppModule';
import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';

/**
 * React hook that resolves the application-scoped navigation module provider.
 *
 * @returns The navigation provider instance.
 * @throws If the navigation module has not been enabled for the application.
 */
export const useNavigationModule = (): INavigationProvider => useAppModule('navigation');
