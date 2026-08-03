import type { Service } from '../types';

/**
 * A service registration expressed the way a test wants to state it.
 *
 * @remarks
 * Only `key` is required; a URI and scopes are derived from it when omitted, so
 * a test can register a service by name alone.
 */
export interface MockService {
  /** Lookup key applications resolve the service by, such as `apps` or `people`. */
  key: string;
  /** Base URI of the service. Defaults to `https://{key}.fusion.test`. */
  uri?: string;
  /** Scopes required for the service. Defaults to `['{key}/.default']`. */
  scopes?: string[];
  /** Human-readable name. Defaults to the key. */
  name?: string;
}

/**
 * Trims trailing slashes so a base URI joins cleanly with a service key.
 *
 * @param baseUri - Base URI as supplied by the test.
 * @returns The base URI without trailing separators.
 */
const normalizeBaseUri = (baseUri: string): string => baseUri.trim().replace(/\/+$/, '');

/**
 * Resolves the URI a service should be reachable at.
 *
 * @remarks
 * An explicit `uri` always wins, so a single service can be redirected without
 * affecting the rest. A `baseUri` points every remaining service at one host,
 * which is how a locally running mock server (Mockoon, Prism, a dev server) is
 * addressed without intercepting HTTP.
 *
 * @param service - The service as declared by the test.
 * @param baseUri - Optional host all otherwise-undeclared services resolve to.
 * @returns The absolute URI for the service.
 */
const makeServiceUri = (service: MockService, baseUri?: string): string => {
  // Preserve a service-specific endpoint so it can target a different mock host.
  if (service.uri) {
    return service.uri;
  }

  // Use the shared host when the test wants all otherwise-unspecified services grouped.
  if (baseUri) {
    return `${normalizeBaseUri(baseUri)}/${service.key}`;
  }

  return `https://${service.key}.fusion.test`;
};

/**
 * Expands a sparse {@link MockService} into a complete {@link Service}.
 *
 * @param service - The service as declared by the test.
 * @param baseUri - Optional host to resolve the service against.
 * @returns A service with every field populated deterministically.
 *
 * @example
 * ```typescript
 * createMockService({ key: 'apps' }, 'http://localhost:3000');
 * // { key: 'apps', uri: 'http://localhost:3000/apps', scopes: ['apps/.default'], … }
 * ```
 */
export const createMockService = (service: MockService, baseUri?: string): Service => {
  const scopes = service.scopes ?? [`${service.key}/.default`];
  return {
    key: service.key,
    uri: makeServiceUri(service, baseUri),
    name: service.name ?? service.key,
    scopes,
    // Deprecated alias kept in sync so code reading either property agrees
    defaultScopes: scopes,
  };
};
