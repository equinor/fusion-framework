import { useCurrentContext as _useCurrentContext } from '@equinor/fusion-framework-react-module-context';
import { useAppModule } from '../useAppModule';

export const useCurrentContext = () => _useCurrentContext(useAppModule('context'));

export default useCurrentContext;
