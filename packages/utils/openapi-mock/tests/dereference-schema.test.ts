import { describe, expect, it } from 'vitest';

import { dereferenceSchema } from '../src/dereference-schema';

describe('dereferenceSchema', () => {
  const document = {
    components: {
      schemas: {
        Pet: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            owner: { $ref: '#/components/schemas/Owner' },
          },
        },
        Owner: {
          type: 'object',
          properties: { name: { type: 'string' } },
        },
      },
    },
  };

  it('inlines a top-level $ref', () => {
    expect(dereferenceSchema({ $ref: '#/components/schemas/Owner' }, document)).toEqual(
      document.components.schemas.Owner,
    );
  });

  it('inlines nested $refs, recursively', () => {
    const result = dereferenceSchema({ $ref: '#/components/schemas/Pet' }, document) as {
      properties: { owner: unknown };
    };

    expect(result.properties.owner).toEqual(document.components.schemas.Owner);
  });

  it('inlines $refs inside arrays', () => {
    const result = dereferenceSchema(
      { type: 'array', items: { $ref: '#/components/schemas/Owner' } },
      document,
    ) as { items: unknown };

    expect(result.items).toEqual(document.components.schemas.Owner);
  });

  it('leaves an unresolvable $ref untouched rather than throwing', () => {
    const schema = { $ref: '#/components/schemas/Missing' };

    expect(dereferenceSchema(schema, document)).toEqual(schema);
  });

  it('breaks a cyclical $ref instead of recursing forever', () => {
    const cyclical = {
      components: {
        schemas: {
          Node: {
            type: 'object',
            properties: { next: { $ref: '#/components/schemas/Node' } },
          },
        },
      },
    };

    const result = dereferenceSchema({ $ref: '#/components/schemas/Node' }, cyclical) as {
      properties: { next: unknown };
    };

    expect(result.properties.next).toEqual({});
  });
});
