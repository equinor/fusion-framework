import { useCurrentContext as _useCurrentContext } from '@equinor/fusion-framework-react-module-context';
import useContextProvider from './useContextProvider';

/**
 * React hook that returns the currently selected Fusion context from the
 * **application-scoped** context module.
 *
 * @returns The current context object, or `undefined` if no context is selected.
 *
 * @example
 * ```tsx
 * const context = useCurrentContext();
 * if (context) {
 *   console.log('Selected:', context.title);
 * }
 * ```
 */
export const useCurrentContext = () => _useCurrentContext(useContextProvider());

export default useCurrentContext;
