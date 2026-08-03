import { applyFieldFakers } from './apply-field-fakers';
import { dereferenceSchema } from './dereference-schema';
import { generateMockFromSchema } from './generate-mock-from-schema';

import type {
  OpenApiDocumentLike,
  OpenApiMock,
  OpenApiMockOptions,
  OpenApiMockOverride,
  OpenApiMockResponse,
} from './types';

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

/** Picks the response OpenAPI documents call the "success" case: the lowest 2xx code, or `default`. */
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
  const code = codes[0] ?? 'default';
  const response = responses[code] as Record<string, unknown> | undefined;
  const content = response?.content as Record<string, unknown> | undefined;
  const media = content?.['application/json'] as Record<string, unknown> | undefined;
  return { status: code === 'default' ? 200 : Number(code), schema: media?.schema };
}

/** Indexes every routable (named) operation across all paths and methods of the document. */
function buildOperations(document: OpenApiDocumentLike): OperationEntry[] {
  const entries: OperationEntry[] = [];
  // Index all paths so resolution can match requests without reparsing the document.
  for (const [pathTemplate, pathItem] of Object.entries(document.paths ?? {})) {
    const { pattern, paramNames } = compilePath(pathTemplate);
    // OpenAPI path items may define several HTTP methods for one route.
    for (const method of ROUTABLE_METHODS) {
      const operation = pathItem[method] as Record<string, unknown> | undefined;
      const operationId = operation?.operationId as string | undefined;
      // operations without an `operationId` cannot be looked up or overridden by name, so are skipped
      // Unnamed operations cannot be addressed by the mock's operation-based API.
      if (!operationId) continue;
      const { status, schema } = pickSuccessResponse(
        operation?.responses as Record<string, unknown> | undefined,
      );
      entries.push({
        method: method.toUpperCase(),
        operationId,
        paramNames,
        pattern,
        responseSchema: schema,
        status,
      });
    }
  }
  return entries;
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
    const { schema, customFakers } = options.fields
      ? applyFieldFakers(entry.responseSchema, document, options.fields)
      : { schema: dereferenceSchema(entry.responseSchema, document), customFakers: undefined };
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
      const upperMethod = method.toUpperCase();
      // Search the indexed operations for the first route matching this request.
      for (const entry of operations) {
        // A route with a different method cannot handle this request.
        if (entry.method !== upperMethod) continue;
        const match = entry.pattern.exec(path);
        // Continue searching when this method's path pattern does not match.
        if (!match) continue;

        const params = Object.fromEntries(
          entry.paramNames
            // Build the named parameter object expected by overrides and responses.
            .map((name, index) => [name, match[index + 1]]),
        );
        const override = overrides.get(entry.operationId);
        const response = override
          ? await override({
              operationId: entry.operationId,
              method: upperMethod,
              path,
              params,
              query,
              mockResponseForOperation: () => fakeOperation(entry),
            })
          : await fakeOperation(entry);
        return { ...response, operationId: entry.operationId, params };
      }
      return undefined;
    },

    register(operationId, handler) {
      findByOperationId(operationId); // throws for a typo'd operationId, rather than silently no-op-ing
      overrides.set(operationId, handler);
    },
  };
}

export default createOpenApiMock;
