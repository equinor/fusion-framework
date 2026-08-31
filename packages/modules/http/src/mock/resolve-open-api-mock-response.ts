/**
 * The subset of `OpenApiMock` (from `@equinor/fusion-openapi-mock`'s
 * `createOpenApiMock`) the adapters in this file need — duck-typed so this
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
 * Resolves a method and URL against an `OpenApiMock`, building a `Response`
 * from whatever it matches — shared by every adapter targeting a different
 * middleware shape, so the method/path/query mapping and status/body wiring
 * lives in one place.
 *
 * @param openApiMock - The mock to resolve against.
 * @param method - The request's HTTP method.
 * @param url - The request's fully resolved URL.
 * @returns The faked `Response`, or `undefined` when no operation matches.
 */
export async function resolveOpenApiMockResponse(
  openApiMock: OpenApiMockLike,
  method: string,
  url: URL,
): Promise<Response | undefined> {
  const result = await openApiMock.resolve({
    method,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
  });
  return result && Response.json(result.mock, { status: result.status });
}
