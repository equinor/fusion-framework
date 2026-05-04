/**
 * React integration for the Fusion HTTP module.
 *
 * Re-exports the {@link useHttpClient} hook for making authenticated HTTP requests
 * from React components, plus core HTTP types and error classes from the
 * underlying `@equinor/fusion-framework-module-http` module.
 *
 * @packageDocumentation
 */
export {
  IHttpClient,
  HttpClientMsal,
  FetchRequestInit,
} from '@equinor/fusion-framework-module-http/client';

export {
  HttpResponseError,
  HttpJsonResponseError,
} from '@equinor/fusion-framework-module-http/errors';

export { useHttpClient } from './useHttpClient';
