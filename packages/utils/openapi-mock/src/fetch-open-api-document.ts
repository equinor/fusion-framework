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
 * Parses `text` as JSON, falling back to YAML.
 *
 * @remarks
 * A strict JSON parse is tried first, since YAML's looser grammar would
 * otherwise silently accept a malformed JSON document instead of surfacing
 * the mistake.
 */
function parseDocumentText(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // Not valid JSON: fall back to YAML, which is a superset grammar of JSON.
    return parseYaml(text);
  }
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
  const parsed = parseDocumentText(text);
  // A valid OpenAPI document is always an object; a bare scalar/array is not one, however
  // validly it parsed, and would otherwise surface as a confusing failure deep in createOpenApiMock.
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Expected the document at ${url} to parse to an object, got ${typeof parsed}.`);
  }
  return parsed as OpenApiDocumentLike;
}

export default fetchOpenApiDocument;
