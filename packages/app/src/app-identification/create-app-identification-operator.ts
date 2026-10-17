import type { FetchRequest } from '@equinor/fusion-framework-module-http/client';
import type { ProcessOperator } from '@equinor/fusion-framework-module-http/operators';

import { appIdentificationHeaders } from './app-identification-headers.js';
import { toOrigin } from './to-origin.js';
import type { AppIdentity } from './types.js';

/**
 * Creates a request operator that adds app identification headers to requests whose
 * target origin is in `allowedOrigins`.
 *
 * Requests to other origins pass through unchanged so that APIs which do not allow the
 * headers never see a new CORS preflight. Headers already present on the request are
 * kept, letting an app override the values per request.
 *
 * @param identity - The app identity to send.
 * @param allowedOrigins - Origins that accept the identification headers.
 * @returns A request operator for an `HttpRequestHandler` pipeline.
 *
 * @example
 * ```ts
 * config.defaultHttpRequestHandler.set(
 *   'fusion-app-identification',
 *   createAppIdentificationOperator({ appKey: 'my-app' }, new Set([window.location.origin])),
 * );
 * ```
 */
export const createAppIdentificationOperator = <T extends FetchRequest = FetchRequest>(
  identity: AppIdentity,
  allowedOrigins: ReadonlySet<string>,
): ProcessOperator<T> => {
  // Version values are optional in the manifest; sending empty headers would add noise to telemetry
  const entries: Array<[string, string]> = [
    [appIdentificationHeaders.app, identity.appKey],
    [appIdentificationHeaders.appVersion, identity.appVersion ?? ''],
    [appIdentificationHeaders.frameworkVersion, identity.frameworkVersion ?? ''],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (request: T): T | undefined => {
    const origin = toOrigin(request.uri, globalThis.location?.origin);
    // Unknown origins may reject custom headers in CORS preflight, so leave those requests untouched
    if (!origin || !allowedOrigins.has(origin)) {
      return undefined;
    }
    const headers = new Headers(request.headers);
    // Per-request values take precedence so an app can override identification for a single call
    for (const [name, value] of entries) {
      // Never overwrite a value the caller set explicitly
      if (!headers.has(name)) {
        headers.set(name, value);
      }
    }
    return { ...request, headers };
  };
};
