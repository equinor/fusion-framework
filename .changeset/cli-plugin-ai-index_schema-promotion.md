---
"@equinor/fusion-framework-cli-plugin-ai-index": minor
---

Add Zod-based schema promotion for Azure AI Search indexes.

New `defineIndexSchema()` factory lets config authors declare which metadata fields should be promoted to top-level Azure AI Search fields, enabling direct OData filtering without `any()` operators.

Features:
- `defineIndexSchema({ shape, prepareAttributes, resolve })` — type-safe schema config with Zod object shape, typed attribute processor, and field resolver
- `zodToAzureFields()` — converts Zod schemas to Azure EDM field definitions with appropriate capabilities
- `applySchema` pipeline step — validates resolved values via Zod and moves promoted fields to `metadata.schemaFields`
- `ffc ai index create --dry-run` — previews the full index schema including promoted fields
- `resolveEmbeddingDimensions()` — maps known embedding models to vector dimensions, with fallback to `embedding.dimensions` config

```typescript
import { z } from 'zod';
import { defineIndexSchema } from '@equinor/fusion-framework-cli-plugin-ai-index';

// Note: `zod` must be a direct dependency of your project.
// The CLI plugin uses zod internally but does not re-export it.
const schema = defineIndexSchema({
  shape: z.object({
    type: z.string(),
    tags: z.array(z.string()).default([]),
  }),
  prepareAttributes: (attrs, doc) => {
    attrs.tags ??= [];
    if (doc.metadata.source.includes('packages/')) attrs.tags.push('package');
    return attrs;
  },
  resolve: (doc) => ({
    type: (doc.metadata.attributes?.type as string) ?? 'unknown',
    tags: (doc.metadata.attributes?.tags as string[]) ?? [],
  }),
});
```

ref: equinor/fusion-core-tasks#1011
