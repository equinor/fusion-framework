import { parse as parseYaml } from 'yaml';

import type { OpenApiDocumentLike } from './types';

/** Options for {@link fetchOpenApiDocument}. */
export interface FetchOpenApiDocumentOptions {
  /**
   * Overrides the `fetch` implementation used to retrieve the document
   * (e.g. one that attaches an auth header, or for a runtime without a
   * global `fetch`).
   */
  fetch?: typeof fetch;
}

/**
 * Fetches and parses an OpenAPI document straight from wherever it's
 * published — JSON or YAML — so nothing needs downloading and committing to
 * the repository just to fake responses against it.
 *
 * @param url - The URL a live OpenAPI document (`openapi.json`/`openapi.yaml`) is served from.
 * @param options - Pass a custom `fetch` (e.g. one that attaches an auth header).
 * @returns The parsed document, ready for {@link createOpenApiMock}.
 * @throws {Error} If the request does not resolve to a 2xx response, or the body is neither valid JSON nor YAML.
 *
 * @example
 * ```typescript
 * const document = await fetchOpenApiDocument('https://api.example.com/openapi.json');
 * const mock = createOpenApiMock(document);
 * ```
 */
export async function fetchOpenApiDocument(
  url: string | URL,
  options: FetchOpenApiDocumentOptions = {},
): Promise<OpenApiDocumentLike> {
  const doFetch = options.fetch ?? fetch;
  const response = await doFetch(url);
  // Surface transport-level failures before attempting to parse an error response as a document.
  if (!response.ok) {
    throw new Error(
      `Failed to fetch the OpenAPI document from ${url}: ${response.status} ${response.statusText}`,
    );
  }
  const text = await response.text();
  // a strict JSON parse first, since YAML's looser grammar would otherwise silently accept
  // a malformed JSON document instead of surfacing the mistake
  try {
    return JSON.parse(text) as OpenApiDocumentLike;
  } catch {
    return parseYaml(text) as OpenApiDocumentLike;
  }
}

export default fetchOpenApiDocument;
