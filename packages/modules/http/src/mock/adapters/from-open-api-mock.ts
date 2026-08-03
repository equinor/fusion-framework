import type { HttpMockMiddleware } from '../HttpMockRouter';

/**
 * The subset of `OpenApiMock` (from `@equinor/fusion-openapi-mock`'s
 * `createOpenApiMock`) {@link fromOpenApiMock} needs — duck-typed so this
 * package has no dependency on that one; anything shaped like this works.
 */
export interface OpenApiMockLike {
  resolve(request: {
    method: string;
    path: string;
    query?: Record<string, string>;
  }): Promise<{ status: number; mock: unknown } | undefined>;
}

/**
 * Adapts an `OpenApiMock` into an {@link HttpMockMiddleware}, so a whole
 * OpenAPI document fakes every matching request with one registration.
 *
 * @remarks
 * A request that matches no operation in the document resolves to
 * `undefined`, which declines the middleware exactly like every other
 * {@link HttpMockMiddleware} — so it composes with `.get`/`.post`/`.use`
 * registrations covering endpoints outside the spec.
 *
 * @param openApiMock - Typically `createOpenApiMock(document)` from `@equinor/fusion-openapi-mock`.
 * @returns A middleware for {@link HttpMockRouter.use}.
 *
 * @example Fake every operation in a spec, straight from the document
 * ```typescript
 * import { createOpenApiMock } from '@equinor/fusion-openapi-mock';
 * import openapi from './openapi.json' with { type: 'json' };
 *
 * configurator.http.use(fromOpenApiMock(createOpenApiMock(openapi)));
 * ```
 */
export function fromOpenApiMock(openApiMock: OpenApiMockLike): HttpMockMiddleware {
  return async (request) => {
    const url = new URL(request.url);
    const result = await openApiMock.resolve({
      method: request.method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
    });
    return result && Response.json(result.mock, { status: result.status });
  };
}

export default fromOpenApiMock;
