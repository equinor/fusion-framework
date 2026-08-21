import type { Faker } from '@faker-js/faker';

import type {
  FieldFakerMap,
  OpenApiDocumentLike,
  OpenApiMock,
  OpenApiMockOptions,
  OpenApiMockOverride,
  OpenApiMockOverrideContext,
  OpenApiMockResponse,
  OperationEntry,
} from '../../types.js';
import { applyFieldFakers } from '../apply-field-fakers.js';
import { dereferenceSchema } from '../dereference-schema.js';
import { generateMockFromSchema } from '../generate-mock-from-schema.js';
import { buildOperations } from './build-operations.js';
import { matchOperation } from './match-operation.js';

/**
 * Fakes `responseSchema`: field-annotating and dereferencing it against
 * `fieldFakerMap` when the caller configured field overrides, otherwise
 * just resolving its `$ref`s.
 */
function resolveResponseSchema(
  responseSchema: unknown,
  document: OpenApiDocumentLike,
  fieldFakerMap: FieldFakerMap | undefined,
): { schema: unknown; customFakers?: Record<string, (faker: Faker) => unknown> } {
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
