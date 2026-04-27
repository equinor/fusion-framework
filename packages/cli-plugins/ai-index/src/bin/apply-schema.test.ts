import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { of, lastValueFrom } from 'rxjs';
import type { VectorStoreDocument } from '@equinor/fusion-framework-module-ai/lib';

import { defineIndexSchema } from '../schema.js';
import { applySchema } from './apply-schema.js';

/** Helper to create a minimal VectorStoreDocument for testing. */
function makeDocument(
  overrides: Partial<VectorStoreDocument> & { metadata: VectorStoreDocument['metadata'] },
): VectorStoreDocument {
  return {
    id: 'test-id',
    pageContent: 'test content',
    ...overrides,
  };
}

describe('defineIndexSchema', () => {
  it('returns the same config object (type-narrowing only)', () => {
    const shape = z.object({ type: z.string() });
    const resolve = () => ({ type: 'tsdoc' });

    const schema = defineIndexSchema({ shape, resolve });

    expect(schema.shape).toBe(shape);
    expect(schema.resolve).toBe(resolve);
  });
});

describe('applySchema', () => {
  const schema = defineIndexSchema({
    shape: z.object({
      pkg_name: z.string().optional(),
      type: z.string(),
      tags: z.array(z.string()).default([]),
      source_dir: z.string(),
    }),
    resolve: (doc) => ({
      pkg_name: doc.metadata.attributes?.pkg_name as string | undefined,
      type: (doc.metadata.attributes?.type as string) ?? 'unknown',
      tags: (doc.metadata.attributes?.tags as string[]) ?? [],
      source_dir: doc.metadata.source.split('/')[0],
    }),
  });

  it('passes through unchanged when schema is undefined', async () => {
    const doc = makeDocument({
      metadata: { source: 'packages/foo/src/index.ts', attributes: { type: 'tsdoc' } },
    });
    const docs$ = of([doc]);

    const result = await lastValueFrom(applySchema(docs$, undefined));

    expect(result).toEqual([doc]);
  });

  it('resolves promoted fields and stores them on metadata.schemaFields', async () => {
    const doc = makeDocument({
      metadata: {
        source: 'packages/foo/src/index.ts',
        attributes: {
          type: 'tsdoc',
          pkg_name: '@equinor/fusion-framework',
          tags: ['package', 'react'],
          other_attr: 'keep-me',
        },
      },
    });
    const docs$ = of([doc]);

    const result = await lastValueFrom(applySchema(docs$, schema));

    expect(result[0].metadata.schemaFields).toEqual({
      pkg_name: '@equinor/fusion-framework',
      type: 'tsdoc',
      tags: ['package', 'react'],
      source_dir: 'packages',
    });
  });

  it('removes promoted keys from attributes to avoid duplication', async () => {
    const doc = makeDocument({
      metadata: {
        source: 'packages/foo/src/index.ts',
        attributes: {
          type: 'tsdoc',
          pkg_name: '@equinor/fusion-framework',
          tags: ['package'],
          git_commit_hash: 'abc123',
        },
      },
    });
    const docs$ = of([doc]);

    const result = await lastValueFrom(applySchema(docs$, schema));

    // Promoted keys removed, non-promoted keys preserved
    expect(result[0].metadata.attributes).toEqual({ git_commit_hash: 'abc123' });
  });

  it('handles documents with no attributes gracefully', async () => {
    const doc = makeDocument({
      metadata: { source: 'cookbooks/app-react/src/App.tsx' },
    });
    const docs$ = of([doc]);

    const result = await lastValueFrom(applySchema(docs$, schema));

    expect(result[0].metadata.schemaFields).toEqual({
      pkg_name: undefined,
      type: 'unknown',
      tags: [],
      source_dir: 'cookbooks',
    });
    expect(result[0].metadata.attributes).toEqual({});
  });

  it('throws when resolved values fail Zod validation', async () => {
    const badSchema = defineIndexSchema({
      shape: z.object({ type: z.string().min(1) }),
      resolve: () => ({ type: '' }), // Empty string fails min(1)
    });

    const doc = makeDocument({
      metadata: { source: 'test.ts', attributes: {} },
    });
    const docs$ = of([doc]);

    await expect(lastValueFrom(applySchema(docs$, badSchema))).rejects.toThrow();
  });

  it('runs prepareAttributes before resolve to enrich attributes', async () => {
    const schemaWithPrepare = defineIndexSchema({
      shape: z.object({
        tags: z.array(z.string()).default([]),
        type: z.string(),
      }),
      prepareAttributes: (attrs, doc) => {
        // Type-safe: attrs.tags is string[] | undefined
        attrs.tags ??= [];
        if (doc.metadata.source.includes('packages/')) {
          attrs.tags.push('package');
        }
        return attrs;
      },
      resolve: (doc) => ({
        tags: (doc.metadata.attributes?.tags as string[]) ?? [],
        type: (doc.metadata.attributes?.type as string) ?? 'unknown',
      }),
    });

    const doc = makeDocument({
      metadata: {
        source: 'packages/framework/src/index.ts',
        attributes: { type: 'tsdoc' },
      },
    });
    const docs$ = of([doc]);

    const result = await lastValueFrom(applySchema(docs$, schemaWithPrepare));

    // prepareAttributes added 'package' tag before resolve consumed it
    expect(result[0].metadata.schemaFields).toEqual({
      tags: ['package'],
      type: 'tsdoc',
    });
  });
});
