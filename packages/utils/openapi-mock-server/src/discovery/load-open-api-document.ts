import { readFile } from 'node:fs/promises';

import { parse as parseYaml } from 'yaml';

import type { OpenApiDocumentLike } from '@equinor/fusion-openapi-mock';

/**
 * Parses `text` as JSON, falling back to YAML.
 *
 * @remarks
 * A strict JSON parse is tried first, since YAML's looser grammar would
 * otherwise silently accept a malformed JSON document instead of surfacing
 * the mistake — mirrors `fetchOpenApiDocument`'s own parsing strategy for a
 * remote document.
 */
function parseDocumentText(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // Not valid JSON: fall back to YAML, a superset grammar of JSON.
    return parseYaml(text);
  }
}

/**
 * Reads and parses an OpenAPI document from a local file, JSON or YAML,
 * ready for {@link createOpenApiMock}.
 *
 * @param filePath - Absolute or relative path to an `openapi.json`/`openapi.yaml` file.
 * @returns The parsed document.
 * @throws {Error} If the file's contents are neither valid JSON nor YAML, or don't parse to an object.
 *
 * @example
 * ```typescript
 * const document = await loadOpenApiDocument('./mocks/context.openapi.json');
 * const mock = createOpenApiMock(document);
 * ```
 */
export async function loadOpenApiDocument(filePath: string): Promise<OpenApiDocumentLike> {
  const text = await readFile(filePath, 'utf-8');
  const parsed = parseDocumentText(text);
  // A valid OpenAPI document is always an object; a bare scalar/array is not one.
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Expected ${filePath} to parse to an object, got ${typeof parsed}.`);
  }
  return parsed as OpenApiDocumentLike;
}

export default loadOpenApiDocument;
