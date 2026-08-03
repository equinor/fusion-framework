import type { ObservableInput } from 'rxjs';

import { HttpClientMsal } from '../lib/client';

import type { HttpMockRouter } from './HttpMockRouter';

/**
 * Builds an `HttpClientMsal` subclass bound to a single {@link HttpMockRouter}.
 *
 * @remarks
 * `HttpClientConfigurator` takes a client constructor once, and constructs it
 * itself (`new ctor(uri, options)`) — there is no room in that call to also
 * pass a router. Binding the router through a closure over a class
 * declaration is what lets a constructor built this way still resolve every
 * request against it, without changing the constructor's public shape.
 *
 * Everything above the network call — `fetch`/`json`/`blob`/`sse$`,
 * `requestHandler`, MSAL scope handling — is the real `HttpClientMsal`
 * unchanged; only {@link HttpClientMsal._performFetch} is replaced, so a test
 * exercises the same request preparation and response pipeline production
 * traffic does.
 *
 * @param router - The router every client built from the returned constructor resolves requests against.
 * @returns A client constructor for {@link HttpClientConfigurator}.
 */
export function createHttpClientMockCtor(
  router: HttpMockRouter,
): new (
  uri: string,
  options?: ConstructorParameters<typeof HttpClientMsal>[1],
) => HttpClientMsal {
  return class HttpClientMock extends HttpClientMsal {
    /**
     * Routes the prepared request through the configurator's mock router.
     *
     * @param uri - The fully resolved request URL.
     * @param init - The prepared fetch options.
     * @returns The router's response observable input.
     */
    protected override _performFetch(uri: string, init: RequestInit): ObservableInput<Response> {
      return router.resolve(uri, init);
    }
  };
}
