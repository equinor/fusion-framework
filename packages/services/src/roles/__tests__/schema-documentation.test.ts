import { readFileSync, readdirSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

/** Directory holding one module per reusable Roles API 1.0 schema. */
const SCHEMA_DIR = new URL('../v1/schemas/', import.meta.url);

/**
 * The retired boilerplate every inferred model type used to carry. It described the mechanism
 * rather than the model, so 92 exported types shared one sentence — useless for hover and
 * actively harmful for retrieval, which had nothing to tell the models apart by.
 */
const RETIRED_BOILERPLATE = 'inferred from the schema rather than declared by hand';

/** Collapses a TSDoc block to a single whitespace-normalized line. */
const normalizeDoc = (block: string): string =>
  block
    .replace(/^\/\*\*/, '')
    .replace(/\*\/$/, '')
    .replace(/^[ \t]*\*[ \t]?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Reads the TSDoc block immediately preceding a declaration in a schema module. */
const docFor = (source: string, declaration: string): string | undefined => {
  const index = source.indexOf(`\n${declaration}`);
  if (index === -1) return undefined;
  const before = source.slice(0, index + 1);
  const open = before.lastIndexOf('/**');
  const close = before.lastIndexOf('*/');
  // The comment must be the declaration's immediate predecessor, not an earlier block.
  if (open === -1 || close === -1 || close < open) return undefined;
  if (before.slice(close + 2).trim() !== '') return undefined;
  return normalizeDoc(before.slice(open, close + 2));
};

/** One row per versioned schema module: its file, exported schema symbol, and inferred type. */
const SCHEMA_CASES = readdirSync(SCHEMA_DIR)
  .filter((file) => file.endsWith('.ts'))
  .sort()
  .map((file) => {
    const source = readFileSync(new URL(file, SCHEMA_DIR), 'utf8');
    const schema = source.match(/export const (\w+) =/)?.[1];
    const model = source.match(/export type (\w+)/)?.[1];
    if (!schema || !model) throw new Error(`${file} does not export a schema and a model type`);
    return { file, schema, model, source };
  });

describe('Roles API 1.0 model documentation', () => {
  it('covers every versioned schema module', () => {
    expect(SCHEMA_CASES).toHaveLength(92);
  });

  it.each(SCHEMA_CASES)('$model', ({ schema, model, source }) => {
    const schemaDoc = docFor(source, `export const ${schema}`);
    const modelDoc = docFor(source, `export type ${model}`);

    expect(schemaDoc, `'${schema}' has no TSDoc block`).toBeTypeOf('string');
    expect(modelDoc, `'${model}' has no TSDoc block`).toBeTypeOf('string');

    // Version identity has to stay visible on both symbols, so a future V2 model can never be
    // mistaken for this one.
    expect(schema).toMatch(/V1$/);
    expect(model).toMatch(/V1$/);

    // Naming the schema is what tells a reader — and a retrieval index — that the type is
    // inferred rather than a second, hand-maintained declaration of the same shape.
    expect(modelDoc).toContain(schema);
    expect(modelDoc?.toLowerCase()).not.toContain(RETIRED_BOILERPLATE);
  });

  it('describes every model differently', () => {
    // Identical summaries across models are what make a retrieval index return the wrong one.
    const summaries = SCHEMA_CASES.map(
      ({ model, source }) =>
        docFor(source, `export type ${model}`)?.split(
          /Roles API 1\.0 model inferred|Inferred from/,
        )[0] ?? model,
    );
    expect(new Set(summaries).size).toBe(SCHEMA_CASES.length);
  });
});
