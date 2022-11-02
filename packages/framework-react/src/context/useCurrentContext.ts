import { useCurrentContext as _useCurrentContext } from '@equinor/fusion-framework-react-module-context';
import { useFramework } from '../useFramework';

export const useCurrentContext = () => _useCurrentContext(useFramework().modules.context);

export default useCurrentContext;
