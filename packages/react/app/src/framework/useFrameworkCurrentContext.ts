import { useFramework } from '@equinor/fusion-framework-react';
import { useCurrentContext } from '@equinor/fusion-framework-react-module-context';

/**
 * React hook that returns the currently selected context from the
 * **framework-level** context module (as opposed to the application-scoped one).
 *
 * Use this when you need the portal/host context rather than the app's own
 * context provider.
 *
 * @returns The current framework context, or `undefined` if none is selected.
 */
export const useFrameworkCurrentContext = () => useCurrentContext(useFramework().modules.context);

export default useFrameworkCurrentContext;
