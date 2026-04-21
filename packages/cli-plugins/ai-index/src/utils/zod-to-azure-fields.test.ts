import { describe, it, expect } from 'vitest';
import { z } from 'zod';

import { zodToAzureFields } from './zod-to-azure-fields.js';

describe('zodToAzureFields', () => {
  it('maps z.string() to Edm.String with filterable + facetable', () => {
    const schema = z.object({ pkg_name: z.string() });
    const fields = zodToAzureFields(schema);

    expect(fields).toEqual([
      {
        name: 'pkg_name',
        type: 'Edm.String',
        filterable: true,
        sortable: false,
        facetable: true,
        searchable: false,
      },
    ]);
  });

  it('maps z.number() to Edm.Double with filterable + sortable', () => {
    const schema = z.object({ score: z.number() });
    const fields = zodToAzureFields(schema);

    expect(fields).toEqual([
      {
        name: 'score',
        type: 'Edm.Double',
        filterable: true,
        sortable: true,
        facetable: false,
        searchable: false,
      },
    ]);
  });

  it('maps z.boolean() to Edm.Boolean with filterable', () => {
    const schema = z.object({ active: z.boolean() });
    const fields = zodToAzureFields(schema);

    expect(fields).toEqual([
      {
        name: 'active',
        type: 'Edm.Boolean',
        filterable: true,
        sortable: false,
        facetable: false,
        searchable: false,
      },
    ]);
  });

  it('maps z.array(z.string()) to Collection(Edm.String) with filterable + facetable', () => {
    const schema = z.object({ tags: z.array(z.string()) });
    const fields = zodToAzureFields(schema);

    expect(fields).toEqual([
      {
        name: 'tags',
        type: 'Collection(Edm.String)',
        filterable: true,
        sortable: false,
        facetable: true,
        searchable: false,
      },
    ]);
  });

  it('maps z.enum() to Edm.String', () => {
    const schema = z.object({ status: z.enum(['draft', 'published']) });
    const fields = zodToAzureFields(schema);

    expect(fields[0]).toMatchObject({ name: 'status', type: 'Edm.String' });
  });

  it('unwraps z.optional() to the inner type', () => {
    const schema = z.object({ pkg_name: z.string().optional() });
    const fields = zodToAzureFields(schema);

    expect(fields[0]).toMatchObject({ name: 'pkg_name', type: 'Edm.String' });
  });

  it('unwraps z.default() to the inner type', () => {
    const schema = z.object({ tags: z.array(z.string()).default([]) });
    const fields = zodToAzureFields(schema);

    expect(fields[0]).toMatchObject({ name: 'tags', type: 'Collection(Edm.String)' });
  });

  it('unwraps z.nullable() to the inner type', () => {
    const schema = z.object({ name: z.string().nullable() });
    const fields = zodToAzureFields(schema);

    expect(fields[0]).toMatchObject({ name: 'name', type: 'Edm.String' });
  });

  it('unwraps nested wrappers (optional + default)', () => {
    const schema = z.object({ tags: z.array(z.string()).default([]).optional() });
    const fields = zodToAzureFields(schema);

    expect(fields[0]).toMatchObject({ name: 'tags', type: 'Collection(Edm.String)' });
  });

  it('handles multiple fields in a single schema', () => {
    const schema = z.object({
      pkg_name: z.string().optional(),
      type: z.string(),
      tags: z.array(z.string()).default([]),
      source_dir: z.string(),
    });
    const fields = zodToAzureFields(schema);

    expect(fields).toHaveLength(4);
    expect(fields.map((f) => f.name)).toEqual(['pkg_name', 'type', 'tags', 'source_dir']);
    expect(fields.map((f) => f.type)).toEqual([
      'Edm.String',
      'Edm.String',
      'Collection(Edm.String)',
      'Edm.String',
    ]);
  });

  it('throws for unsupported Zod types (z.object)', () => {
    const schema = z.object({ nested: z.object({ a: z.string() }) });

    expect(() => zodToAzureFields(schema)).toThrow(/Unsupported Zod type/);
  });

  it('throws for unsupported array element types (z.array(z.number()))', () => {
    const schema = z.object({ nums: z.array(z.number()) });

    expect(() => zodToAzureFields(schema)).toThrow(/Unsupported array element type/);
  });
});
