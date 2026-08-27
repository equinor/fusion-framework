import { z } from 'zod';
import { describe, expect, it } from 'vitest';

import { apiPagedCollectionSchemaV1 } from '../v1/schemas/api-paged-collection-schema-v1';
import { ApiRoleSchemaV1 } from '../v1/schemas/api-role-schema-v1';

type SchemaNode = z.ZodType<unknown> & {
  readonly description?: string;
  readonly def: {
    readonly type?: string;
    readonly left?: SchemaNode;
    readonly right?: SchemaNode;
  };
  readonly shape?: Record<string, SchemaNode>;
};

type ObjectSchemaNode = SchemaNode & {
  readonly shape: Record<string, SchemaNode>;
};

interface SchemaCase {
  readonly name: string;
  readonly schema: SchemaNode;
}

interface ViteImportMeta extends ImportMeta {
  glob<TModule>(pattern: string, options: { readonly eager: true }): Record<string, TModule>;
}

/** Schema modules discovered from the Roles API 1.0 source tree. */
const SCHEMA_MODULES = (import.meta as ViteImportMeta).glob<Record<string, unknown>>(
  '../v1/schemas/*.ts',
  { eager: true },
);

/** Returns whether a module export is a concrete Zod schema. */
const isSchemaNode = (value: unknown): value is SchemaNode => value instanceof z.ZodType;

/** Resolves the single concrete schema exported by a versioned schema module. */
const schemaCaseFromModule = (
  path: string,
  schemaModule: Record<string, unknown>,
): SchemaCase | undefined => {
  const concreteSchemas = Object.entries(schemaModule).filter(
    ([name, value]) => name.endsWith('SchemaV1') && isSchemaNode(value),
  );

  // The paged collection module exports a schema factory because its item type is endpoint-specific.
  if (path.endsWith('/api-paged-collection-schema-v1.ts')) {
    return {
      name: 'apiPagedCollectionSchemaV1',
      schema: apiPagedCollectionSchemaV1(ApiRoleSchemaV1) as SchemaNode,
    };
  }

  if (concreteSchemas.length !== 1) {
    throw new Error(`${path} must export exactly one concrete versioned schema`);
  }

  const [schemaEntry] = concreteSchemas;
  if (!schemaEntry) {
    throw new Error(`${path} did not provide its concrete versioned schema`);
  }

  const [name, schema] = schemaEntry;
  return { name, schema: schema as SchemaNode };
};

/** Every exported Roles API 1.0 schema, discovered without a hand-maintained registry. */
const SCHEMA_CASES: readonly SchemaCase[] = Object.entries(SCHEMA_MODULES)
  .map(([path, schemaModule]) => schemaCaseFromModule(path, schemaModule))
  .filter((schemaCase): schemaCase is SchemaCase => schemaCase !== undefined)
  .sort(({ name: left }, { name: right }) => left.localeCompare(right));

/** Returns whether a schema exposes a Zod object shape. */
const isObjectSchema = (schema: SchemaNode): schema is ObjectSchemaNode =>
  typeof schema.shape === 'object' && schema.shape !== null;

/** Collects root object schemas, including inline operands nested inside intersections. */
const collectObjectSchemas = (schema: SchemaNode): readonly ObjectSchemaNode[] => {
  if (isObjectSchema(schema)) return [schema];
  if (schema.def.type === 'intersection' && schema.def.left && schema.def.right) {
    return [...collectObjectSchemas(schema.def.left), ...collectObjectSchemas(schema.def.right)];
  }
  return [];
};

/** Resolves a field schema from a parsed issue path on a top-level object schema. */
const schemaAtPath = (
  schema: ObjectSchemaNode,
  path: readonly PropertyKey[],
): SchemaNode | undefined => {
  const [segment] = path;
  return typeof segment === 'string' ? schema.shape[segment] : undefined;
};

describe('Roles API 1.0 schema descriptions', () => {
  it('covers every exported schema module', () => {
    expect(SCHEMA_CASES).toHaveLength(Object.keys(SCHEMA_MODULES).length);
    expect(SCHEMA_CASES).toHaveLength(92);
  });

  it.each(SCHEMA_CASES)('$name exposes a non-empty root description', ({ name, schema }) => {
    expect(schema.description?.trim(), `${name} is missing schema.description`).toBeTruthy();
  });

  it.each(SCHEMA_CASES)(
    '$name exposes non-empty descriptions on every object field schema',
    ({ name, schema }) => {
      const objectSchemas = collectObjectSchemas(schema);

      for (const objectSchema of objectSchemas) {
        for (const [fieldName, fieldSchema] of Object.entries(objectSchema.shape)) {
          expect(
            fieldSchema.description?.trim(),
            `${name}.${fieldName} is missing schema.description`,
          ).toBeTruthy();
        }
      }
    },
  );

  it('can resolve a described field schema from a parsed issue path', () => {
    const result = ApiRoleSchemaV1.safeParse({ displayName: 42 });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error('ApiRoleSchemaV1 unexpectedly accepted an invalid displayName');
    }

    const issue = result.error.issues.find(({ path }) => path[0] === 'displayName');
    const [baseRoleSchema] = collectObjectSchemas(ApiRoleSchemaV1 as SchemaNode);

    expect(issue?.path).toStrictEqual(['displayName']);
    expect(baseRoleSchema && schemaAtPath(baseRoleSchema, issue?.path ?? [])?.description).toBe(
      'Human-readable display name of the role.',
    );
  });
});
