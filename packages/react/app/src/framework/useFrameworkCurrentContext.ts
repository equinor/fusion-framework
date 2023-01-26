import { useFramework } from '@equinor/fusion-framework-react';
import { useCurrentContext } from '@equinor/fusion-framework-react-module-context';

export const useFrameworkCurrentContext = () => useCurrentContext(useFramework().modules.context);

export default useFrameworkCurrentContext;
