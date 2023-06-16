import { useCurrentContext as _useCurrentContext } from '@equinor/fusion-framework-react-module-context';
import useContextProvider from './useContextProvider';

export const useCurrentContext = () => _useCurrentContext(useContextProvider());

export default useCurrentContext;
