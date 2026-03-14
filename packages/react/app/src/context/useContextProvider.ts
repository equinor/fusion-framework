import type { ContextModule } from '@equinor/fusion-framework-react-module-context';
import { useAppModule } from '../useAppModule';

/**
 * React hook that resolves the application-scoped context module provider.
 *
 * @returns The context module provider instance.
 * @throws If the context module is not registered in the application scope.
 */
export const useContextProvider = () => useAppModule<ContextModule>('context');

export default useContextProvider;
