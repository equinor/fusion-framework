import type { OpenApiDocumentLike, OperationEntry } from '../../types.js';

// OpenAPI 3 only defines these methods as routable; every other method is ignored.
const ROUTABLE_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const;

/**
 * Turns an OpenAPI path template (`/pets/{petId}`) into a matcher.
 *
 * @remarks
 * A `{param}` segment always spans exactly one path segment — the same
 * assumption OpenAPI's own path templating makes — so every other character
 * is escaped and matched literally.
 */
function compilePath(pathTemplate: string): { pattern: RegExp; paramNames: string[] } {
  const paramNames: string[] = [];
  const segments = pathTemplate
    .split('/')
    // Convert each template segment independently so parameter names stay aligned.
    .map((segment) => {
      const param = segment.match(/^\{(.+)\}$/);
      // Template parameters become capture groups; literal segments remain escaped.
      if (param) {
        paramNames.push(param[1]);
        return '([^/]+)';
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    });
  return { pattern: new RegExp(`^${segments.join('/')}$`), paramNames };
}

/** Reads the response body schema (if any) declared for `code` in `responses`. */
function schemaForCode(responses: Record<string, unknown>, code: string): unknown {
  const response = responses[code] as Record<string, unknown> | undefined;
  const content = response?.content as Record<string, unknown> | undefined;
  const media = content?.['application/json'] as Record<string, unknown> | undefined;
  return media?.schema;
}

/**
 * Picks the response OpenAPI documents call the "success" case: the lowest
 * 2xx code, or `default`. Falls back to the lowest declared numeric status
 * code (e.g. an operation that only declares `404`) rather than a `200` the
 * document never actually promises.
 */
function pickSuccessResponse(responses: Record<string, unknown> | undefined): {
  status: number;
  schema?: unknown;
} {
  // A missing response map still has the conventional successful status.
  if (!responses) return { status: 200 };
  const codes = Object.keys(responses)
    // Only successful responses form the mock's normal baseline.
    .filter((code) => /^2\d\d$/.test(code))
    .sort();
  // A declared 2xx always outranks `default` as the conventional success case.
  if (codes.length > 0) {
    const code = codes[0];
    return { status: Number(code), schema: schemaForCode(responses, code) };
  }
  // `default` is OpenAPI's documented catch-all, and conventionally represents success absent a 2xx.
  if ('default' in responses) {
    return { status: 200, schema: schemaForCode(responses, 'default') };
  }
  const numericCodes = Object.keys(responses)
    // Neither 2xx nor default is declared, so any other numeric status is the closest fallback.
    .filter((code) => /^\d\d\d$/.test(code))
    .sort();
  const fallbackCode = numericCodes[0];
  // No numeric status is declared at all: nothing better than the conventional 200 remains.
  if (fallbackCode === undefined) return { status: 200 };
  return { status: Number(fallbackCode), schema: schemaForCode(responses, fallbackCode) };
}

/** Builds the {@link OperationEntry} for one path item's method, or `undefined` if it isn't routable. */
function buildOperationEntry(
  pathItem: Record<string, unknown>,
  method: (typeof ROUTABLE_METHODS)[number],
  pattern: RegExp,
  paramNames: string[],
): OperationEntry | undefined {
  const operation = pathItem[method] as Record<string, unknown> | undefined;
  const operationId = operation?.operationId as string | undefined;
  // Unnamed operations cannot be addressed by the mock's operation-based API, so are skipped.
  if (!operationId) return undefined;
  const { status, schema } = pickSuccessResponse(
    operation?.responses as Record<string, unknown> | undefined,
  );
  return {
    method: method.toUpperCase(),
    operationId,
    paramNames,
    pattern,
    responseSchema: schema,
    status,
  };
}

/**
 * Sorts operations so literal path segments win over templated ones (fewer
 * params first), otherwise a templated route like `/pets/{petId}` can shadow
 * a more specific literal route depending on the order the spec declares
 * paths in.
 */
function bySpecificity(a: OperationEntry, b: OperationEntry): number {
  return a.paramNames.length - b.paramNames.length;
}

/**
 * Indexes every routable (named) operation across all paths and methods of the document.
 *
 * @param document - The parsed OpenAPI document to index.
 * @returns The indexed operations, sorted by specificity (see {@link bySpecificity}).
 */
export function buildOperations(document: OpenApiDocumentLike): OperationEntry[] {
  const entries = Object.entries(document.paths ?? {})
    // Each path template expands into up to one entry per routable HTTP method.
    .flatMap(([pathTemplate, pathItem]) => {
      const { pattern, paramNames } = compilePath(pathTemplate);
      return (
        ROUTABLE_METHODS
          // Build only the methods this path item actually declares an operation for.
          .map((method) => buildOperationEntry(pathItem, method, pattern, paramNames))
          // Drop the methods this path item did not declare an operation for.
          .filter((entry): entry is OperationEntry => entry !== undefined)
      );
    });
  return entries.sort(bySpecificity);
}
export default buildOperations;
