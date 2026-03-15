/**
 * Context React hooks.
 *
 * @remarks
 * Available via the `@equinor/fusion-framework-react/context` sub-entry-point.
 * Re-exports the context module’s React API and adds a convenience
 * `useCurrentContext` hook that resolves the module from the framework.
 *
 * @module
 */
export * from '@equinor/fusion-framework-react-module-context';

export { useCurrentContext } from './useCurrentContext';
