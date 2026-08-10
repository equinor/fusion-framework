import type { HttpMiddleware } from '../lib/operators/types';

import { resolveOpenApiMockResponse, type OpenApiMockLike } from './resolve-open-api-mock-response';

/**
 * Adapts an `OpenApiMock` into an {@link HttpMiddleware}, so
 * `configurator.http.addMiddleware(...)` fakes every matching request
 * straight from an OpenAPI document — no separate mock configurator needed.
 *
 * @remarks
 * A request that matches no operation in the document falls through to
 * `next`, so this composes with whatever else is registered — including the
 * real network call, or another middleware further down the chain. Because
 * `addMiddleware` wraps `_performFetch` rather than replacing it, the exact
 * same registration also fakes requests through any client this configurator
 * builds, so app config never has to branch on whether it's under test.
 *
 * @param openApiMock - Typically `createOpenApiMock(document)` from `@equinor/fusion-openapi-mock`.
 * @returns A middleware for {@link IHttpClientConfigurator.addMiddleware}.
 *
 * @example Fake every operation in a spec, straight from the document
 * ```typescript
 * import { createOpenApiMock } from '@equinor/fusion-openapi-mock';
 * import openapi from './openapi.json' with { type: 'json' };
 *
 * configurator.http.addMiddleware(createOpenApiMockMiddleware(createOpenApiMock(openapi)));
 * ```
 */
export function createOpenApiMockMiddleware(openApiMock: OpenApiMockLike): HttpMiddleware {
  return async (uri, init, next) => {
    const response = await resolveOpenApiMockResponse(
      openApiMock,
      init.method ?? 'GET',
      new URL(uri),
    );
    return response ?? next(uri, init);
  };
}

export default createOpenApiMockMiddleware;
