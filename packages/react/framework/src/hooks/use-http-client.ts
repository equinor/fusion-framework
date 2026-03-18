import { useMemo } from 'react';
import type { Fusion } from '@equinor/fusion-framework';
import { useFramework } from '../useFramework';

/** Resolved HTTP client instance returned by the framework HTTP module. */
type HttpClient = ReturnType<Fusion['modules']['http']['createClient']>;

/** Well-known HTTP client keys pre-configured by the framework. */
type FrameworkHttpClient = 'portal' | 'people';

/**
 * React hook that returns a pre-configured HTTP client from the framework.
 *
 * @param name - Key of the HTTP client to retrieve (e.g. `'portal'` or `'people'`).
 * @returns The resolved {@link HttpClient} instance.
 * @throws {Error} If no client is configured for the given key.
 *
 * @example
 * ```ts
 * const client = useHttpClient('portal');
 * client.fetch('/api/data').subscribe(console.log);
 * ```
 */
export const useHttpClient = (name: FrameworkHttpClient): HttpClient => {
  const framework = useFramework();

  const client = useMemo(() => {
    if (framework.modules.http.hasClient(name)) {
      return framework.modules.http.createClient(name);
    }
    throw Error(`no configured client for key [${name}]`);
  }, [framework, name]);
  // TODO - abort on unmount?
  return client;
};
