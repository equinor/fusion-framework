import { applyFieldFakers } from './apply-field-fakers';
import { dereferenceSchema } from './dereference-schema';
import { generateMockFromSchema } from './generate-mock-from-schema';

import type {
  FieldFakerFn,
  FieldFakerMap,
  OpenApiDocumentLike,
  OpenApiMock,
  OpenApiMockOptions,
  OpenApiMockOverride,
  OpenApiMockOverrideContext,
  OpenApiMockResponse,
} from './types';

// OpenAPI 3 only defines these methods as routable; every other method is ignored.
const ROUTABLE_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const;

interface OperationEntry {
  method: string;
  operationId: string;
  paramNames: string[];
  pattern: RegExp;
  responseSchema?: unknown;
  status: number;
}

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

/** Indexes every routable (named) operation across all paths and methods of the document. */
function buildOperations(document: OpenApiDocumentLike): OperationEntry[] {
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

/** Extracts named path parameters from a compiled pattern's exec match. */
function paramsFromMatch(paramNames: string[], match: RegExpExecArray): Record<string, string> {
  return Object.fromEntries(
    paramNames
      // Pair each declared name with the capture group at the same index.
      .map((name, index) => [name, match[index + 1]]),
  );
}

/** The first indexed operation (and its extracted path params) matching a method and path, if any. */
function matchOperation(
  operations: OperationEntry[],
  method: string,
  path: string,
): { entry: OperationEntry; params: Record<string, string> } | undefined {
  const upperMethod = method.toUpperCase();
  const match = operations
    // Only same-method entries can possibly match this request.
    .filter((entry) => entry.method === upperMethod)
    // Try every candidate pattern against the path up front so `.find` can pick the first hit.
    .map((entry) => ({ entry, match: entry.pattern.exec(path) }))
    // The first pattern (by specificity order) whose regex actually matches this path wins.
    .find((candidate): candidate is { entry: OperationEntry; match: RegExpExecArray } =>
      Boolean(candidate.match),
    );
  // No candidate's pattern matched this path at all.
  if (!match) return undefined;
  return { entry: match.entry, params: paramsFromMatch(match.entry.paramNames, match.match) };
}

/**
 * Fakes `responseSchema`: field-annotating and dereferencing it against
 * `fieldFakerMap` when the caller configured field overrides, otherwise
 * just resolving its `$ref`s.
 */
function resolveResponseSchema(
  responseSchema: unknown,
  document: OpenApiDocumentLike,
  fieldFakerMap: FieldFakerMap | undefined,
): { schema: unknown; customFakers?: Record<string, FieldFakerFn> } {
  // Field fakers additionally track which model/path each node was reached through,
  // so the heavier walk only runs when the caller actually configured field overrides.
  if (fieldFakerMap) return applyFieldFakers(responseSchema, document, fieldFakerMap);
  return { schema: dereferenceSchema(responseSchema, document) };
}

/**
 * Resolves the response for a matched operation: the registered
 * {@link OpenApiMockOverride} if one exists for it, otherwise the generated
 * baseline.
 */
function resolveMatchedResponse(
  entry: OperationEntry,
  context: Omit<OpenApiMockOverrideContext, 'mockResponseForOperation'>,
  override: OpenApiMockOverride | undefined,
  fakeOperation: (entry: OperationEntry) => Promise<OpenApiMockResponse>,
): Promise<OpenApiMockResponse> {
  // No override registered for this operation: the generated baseline is the response as-is.
  if (!override) return fakeOperation(entry);
  return Promise.resolve(
    override({ ...context, mockResponseForOperation: () => fakeOperation(entry) }),
  );
}

/**
 * Fakes and resolves responses for the operations of an OpenAPI 3 document,
 * so a client can be tested against something schema-shaped from the moment
 * a spec exists — no hand-written fixtures until a specific edge case needs
 * one.
 *
 * @remarks
 * Every operation with an `operationId` is faked from its declared "success"
 * response schema (the lowest `2xx`, falling back to `default`) the first
 * time it's requested; {@link OpenApiMockOptions.overrides} or
 * {@link OpenApiMock.register} replace that for the operations an edge case
 * cares about, leaving every other operation on the generated baseline.
 *
 * @param document - A parsed OpenAPI 3 document (e.g. `JSON.parse(await readFile('openapi.json'))`).
 * @param options - Overrides for specific operations.
 * @returns A mock resolvable by request ({@link OpenApiMock.resolve}) or by `operationId` directly.
 * @throws {Error} When an override is registered for an unknown operation ID.
 *
 * @example Zero-friction baseline, straight from a spec
 * ```typescript
 * import openapi from './openapi.json' with { type: 'json' };
 *
 * const mock = createOpenApiMock(openapi);
 * const response = await mock.resolve({ method: 'GET', path: '/pets/1' });
 * // response?.mock is already shaped like the document's Pet schema
 * ```
 *
 * @example Overriding one operation for an edge case
 * ```typescript
 * const mock = createOpenApiMock(openapi, {
 *   overrides: {
 *     getPetById: async ({ params, mockResponseForOperation }) => {
 *       const baseline = await mockResponseForOperation();
 *       return { ...baseline, mock: { ...baseline.mock, id: params.petId, status: 'sold' } };
 *     },
 *   },
 * });
 * ```
 */
export function createOpenApiMock(
  document: OpenApiDocumentLike,
  options: OpenApiMockOptions = {},
): OpenApiMock {
  const operations = buildOperations(document);
  const overrides = new Map<string, OpenApiMockOverride>(Object.entries(options.overrides ?? {}));

  async function fakeOperation(entry: OperationEntry): Promise<OpenApiMockResponse> {
    // Operations without a response schema still need their declared status represented.
    if (!entry.responseSchema) return { status: entry.status, mock: undefined };

    const { schema, customFakers } = resolveResponseSchema(
      entry.responseSchema,
      document,
      options.fields,
    );
    return {
      status: entry.status,
      mock: await generateMockFromSchema(schema, { seed: options.seed, customFakers }),
    };
  }

  function findByOperationId(operationId: string): OperationEntry {
    // Resolve overrides by the public operation name rather than by route position.
    const entry = operations.find((candidate) => candidate.operationId === operationId);
    // Fail early so misspelled operation IDs do not silently produce unusable mocks.
    if (!entry) {
      throw new Error(`No operation named "${operationId}" was found in the OpenAPI document.`);
    }
    return entry;
  }

  return {
    // async so a bad operationId rejects the returned promise instead of throwing synchronously
    mockResponseForOperation: async (operationId) => fakeOperation(findByOperationId(operationId)),

    async resolve({ method, path, query = {} }) {
      const matched = matchOperation(operations, method, path);
      // No indexed operation covers this method/path combination.
      if (!matched) return undefined;

      const { entry, params } = matched;
      const override = overrides.get(entry.operationId);
      const response = await resolveMatchedResponse(
        entry,
        { operationId: entry.operationId, method: entry.method, path, params, query },
        override,
        fakeOperation,
      );
      return { ...response, operationId: entry.operationId, params };
    },

    register(operationId, handler) {
      findByOperationId(operationId); // throws for a typo'd operationId, rather than silently no-op-ing
      overrides.set(operationId, handler);
    },
  };
}
export default createOpenApiMock;
