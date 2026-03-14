/**
 * Framework sub-path entry-point.
 *
 * Re-exports framework-level hooks (as opposed to application-scoped ones)
 * for accessing the Fusion instance, current user, and HTTP clients.
 *
 * @packageDocumentation
 */
export { useFramework } from '@equinor/fusion-framework-react';

export {
  useCurrentUser,
  useHttpClient as useFrameworkHttpClient,
} from '@equinor/fusion-framework-react/hooks';
