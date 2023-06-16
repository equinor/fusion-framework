import { type ContextModule } from '@equinor/fusion-framework-react-module-context';
import { useAppModule } from '../useAppModule';

export const useContextProvider = () => useAppModule<ContextModule>('context');

export default useContextProvider;
