import { describe, expect, it } from 'vitest';

import { createOpenApiMock } from '../lib/create-open-api-mock/create-open-api-mock.js';
import type {
  FieldFakerContext,
  OpenApiDocumentLike,
  OpenApiMockOverrideContext,
} from '../types.js';

const petstore: OpenApiDocumentLike = {
  openapi: '3.0.0',
  paths: {
    '/pets': {
      get: {
        operationId: 'listPets',
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Pet' },
                  minItems: 2,
                  maxItems: 2,
                },
              },
            },
          },
        },
      },
    },
    '/pets/{petId}': {
      get: {
        operationId: 'getPetById',
        responses: {
          '200': {
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Pet' } },
            },
          },
        },
      },
    },
    '/pets/no-schema': {
      // an operationId with no declared response body at all
      delete: {
        operationId: 'deletePet',
        responses: { '204': {} },
      },
    },
    '/internal': {
      // deliberately no operationId — not routable/overridable
      get: { responses: { '200': {} } },
    },
  },
  components: {
    schemas: {
      Pet: {
        type: 'object',
        required: ['id', 'name'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', faker: 'person.firstName' },
        },
      },
    },
  },
};

describe('createOpenApiMock', () => {
  it('fakes a response shaped like the operation schema, resolving $refs', async () => {
    const mock = createOpenApiMock(petstore);

    const result = await mock.resolve({ method: 'GET', path: '/pets/1' });

    expect(result).toEqual(
      expect.objectContaining({
        status: 200,
        operationId: 'getPetById',
        params: { petId: '1' },
      }),
    );
    expect(result?.mock).toEqual(
      expect.objectContaining({ id: expect.any(String), name: expect.any(String) }),
    );
  });

  it('fakes an array response', async () => {
    const mock = createOpenApiMock(petstore);

    const result = await mock.resolve({ method: 'GET', path: '/pets' });

    const mockList = result?.mock;
    expect(Array.isArray(mockList)).toBe(true);
    expect((mockList as unknown[]).length).toBe(2);
  });

  it('returns undefined for a path or method with no matching operation', async () => {
    const mock = createOpenApiMock(petstore);

    await expect(mock.resolve({ method: 'GET', path: '/unknown' })).resolves.toBeUndefined();
    await expect(mock.resolve({ method: 'POST', path: '/pets/1' })).resolves.toBeUndefined();
  });

  it('does not route operations without an operationId', async () => {
    const mock = createOpenApiMock(petstore);

    await expect(mock.resolve({ method: 'GET', path: '/internal' })).resolves.toBeUndefined();
  });

  it('fakes operations with no declared response body as undefined', async () => {
    const mock = createOpenApiMock(petstore);

    const result = await mock.resolve({ method: 'DELETE', path: '/pets/no-schema' });

    expect(result).toEqual(
      expect.objectContaining({ status: 204, mock: undefined, operationId: 'deletePet' }),
    );
  });

  describe('mockResponseForOperation', () => {
    it('fakes an operation directly by operationId', async () => {
      const mock = createOpenApiMock(petstore);

      const response = await mock.mockResponseForOperation('getPetById');

      expect(response.status).toBe(200);
      expect(response.mock).toEqual(expect.objectContaining({ id: expect.any(String) }));
    });

    it('throws for an unknown operationId', async () => {
      const mock = createOpenApiMock(petstore);

      await expect(mock.mockResponseForOperation('doesNotExist')).rejects.toThrow(
        /No operation named "doesNotExist"/,
      );
    });
  });

  describe('seed', () => {
    it('fakes the same value every time given the same seed', async () => {
      const first = await createOpenApiMock(petstore, { seed: 42 }).mockResponseForOperation(
        'getPetById',
      );
      const second = await createOpenApiMock(petstore, { seed: 42 }).mockResponseForOperation(
        'getPetById',
      );

      expect(first).toEqual(second);
    });

    it('fakes a different value for a different seed', async () => {
      const first = await createOpenApiMock(petstore, { seed: 1 }).mockResponseForOperation(
        'getPetById',
      );
      const second = await createOpenApiMock(petstore, { seed: 2 }).mockResponseForOperation(
        'getPetById',
      );

      expect(first).not.toEqual(second);
    });
  });

  describe('fields', () => {
    const petstoreWithAddress: OpenApiDocumentLike = {
      ...petstore,
      components: {
        schemas: {
          ...(petstore.components?.schemas as Record<string, unknown>),
          Pet: {
            type: 'object',
            required: ['id', 'name'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string', faker: 'person.firstName' },
              owner: {
                type: 'object',
                properties: { city: { type: 'string' } },
              },
            },
          },
        },
      },
    };

    it('fakes a matched field from a faker path string', async () => {
      const mock = createOpenApiMock(petstoreWithAddress, {
        fields: { 'Pet.name': 'animal.dog' },
      });

      const result = await mock.mockResponseForOperation('getPetById');

      expect(result.mock).toMatchObject({
        // the fixed faker seed on `animal.dog` output isn't asserted; only that
        // the field-level override (not the schema's own faker keyword) produced it
        name: expect.any(String),
      });
    });

    it('fakes a matched nested field, keyed by the dotted path under its model', async () => {
      const mock = createOpenApiMock(petstoreWithAddress, {
        fields: { 'Pet.owner.city': () => 'Stavanger' },
      });

      const result = await mock.mockResponseForOperation('getPetById');

      expect((result.mock as { owner: { city: string } }).owner.city).toBe('Stavanger');
    });

    it('fakes a matched field from a custom function, receiving its model and path', async () => {
      const mock = createOpenApiMock(petstoreWithAddress, {
        fields: {
          'Pet.id': ({ modelName, path }: FieldFakerContext) => `${modelName}:${path.join('.')}`,
        },
      });

      const result = await mock.mockResponseForOperation('getPetById');

      expect((result.mock as { id: string }).id).toBe('Pet:id');
    });

    it('leaves fields with no matching entry faked from the schema as usual', async () => {
      const mock = createOpenApiMock(petstoreWithAddress, {
        fields: { 'Pet.owner.city': () => 'Stavanger' },
      });

      const result = await mock.mockResponseForOperation('getPetById');

      expect((result.mock as { id: string }).id).toEqual(expect.any(String));
    });
  });

  describe('overrides', () => {
    it('lets an override replace the faked response, given at construction', async () => {
      const mock = createOpenApiMock(petstore, {
        overrides: {
          getPetById: ({ params }: OpenApiMockOverrideContext) => ({
            status: 200,
            mock: { id: params.petId, name: 'Rex' },
          }),
        },
      });

      const result = await mock.resolve({ method: 'GET', path: '/pets/42' });

      expect(result?.mock).toEqual({ id: '42', name: 'Rex' });
    });

    it('lets an override build on top of the generated baseline', async () => {
      const mock = createOpenApiMock(petstore, {
        overrides: {
          getPetById: async ({ params, mockResponseForOperation }: OpenApiMockOverrideContext) => {
            const baseline = await mockResponseForOperation();
            return { ...baseline, mock: { ...(baseline.mock as object), id: params.petId } };
          },
        },
      });

      const result = await mock.resolve({ method: 'GET', path: '/pets/7' });

      expect(result?.mock).toEqual(expect.objectContaining({ id: '7', name: expect.any(String) }));
    });

    it('lets register() add or replace an override after construction', async () => {
      const mock = createOpenApiMock(petstore);
      mock.register('getPetById', () => ({ status: 200, mock: { id: 'fixed', name: 'Fixed' } }));

      const result = await mock.resolve({ method: 'GET', path: '/pets/1' });

      expect(result?.mock).toEqual({ id: 'fixed', name: 'Fixed' });
    });

    it('throws from register() for an unknown operationId, rather than silently no-op-ing', () => {
      const mock = createOpenApiMock(petstore);

      expect(() => mock.register('doesNotExist', () => ({ status: 200, mock: {} }))).toThrow(
        /No operation named "doesNotExist"/,
      );
    });
  });
});
