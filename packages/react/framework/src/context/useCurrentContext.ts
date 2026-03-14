import { useCurrentContext as _useCurrentContext } from '@equinor/fusion-framework-react-module-context';
import { useFramework } from '../useFramework';

/**
 * React hook that returns the currently selected Fusion context.
 *
 * @remarks
 * This is a convenience wrapper that resolves the context module from the
 * framework instance and delegates to the underlying
 * `useCurrentContext` hook from `@equinor/fusion-framework-react-module-context`.
 *
 * @returns The current context state as defined by the context module.
 *
 * @example
 * ```ts
 * const { currentContext } = useCurrentContext();
 * console.log(currentContext?.id);
 * ```
 */
export const useCurrentContext = () => _useCurrentContext(useFramework().modules.context);

export default useCurrentContext;
