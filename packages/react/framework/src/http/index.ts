/**
 * HTTP sub-entry-point (`@equinor/fusion-framework-react/http`).
 *
 * @remarks
 * Re-exports the framework-level {@link useHttpClient} hook as
 * `useFrameworkHttpClient` together with all exports from the
 * standalone HTTP React module.
 *
 * @module
 */
export { useHttpClient as useFrameworkHttpClient } from '../hooks/use-http-client';

export * from '@equinor/fusion-framework-react-module-http';
