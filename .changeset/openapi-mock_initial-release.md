---
"@equinor/fusion-openapi-mock": minor
---

Add `@equinor/fusion-openapi-mock`: fakes OpenAPI 3 responses straight from a parsed spec document, so testing an API-shaped client needs no hand-written fixtures until a specific edge case needs overriding.

```typescript
import { createOpenApiMock, fetchOpenApiDocument } from '@equinor/fusion-openapi-mock';

const openapi = await fetchOpenApiDocument('https://api.example.com/openapi.json');
const mock = createOpenApiMock(openapi, { seed: 42 });

const response = await mock.resolve({ method: 'GET', path: '/pets/1' });
// response.mock is already shaped like the operation's declared response schema
```

Highlights:

- Every operation with an `operationId` is faked from its declared success response schema, `$ref`s resolved against the document — no hand-written mock data needed to get started.
- `overrides` (at construction) and `.register(operationId, handler)` (afterwards) replace the faked response for just the operations an edge case cares about.
- `seed` makes faked output repeatable across runs, for assertions against concrete expected values instead of `expect.any(...)`.
- `fetchOpenApiDocument(url, options?)` fetches and parses a JSON or YAML spec from a URL, so there's no need to download and commit a copy that can drift out of sync.
- `fields`, a `FieldFakerMap` keyed `"<ModelName>.<field>"`, fakes specific fields with a `@faker-js/faker` path string or a real function — without editing the spec itself. `loadFakerMap(source)` loads one from a `.json`/`.yml`/`.yaml`/`.ts`/`.js` sidecar file (functions require `.ts`/`.js`), or accepts an already-built map.
- No dependency on any HTTP or routing framework: `resolve({ method, path, query })` returns a plain `{ status, mock }`, so it drops into `@equinor/fusion-framework-module-http`'s mock router, `openapi-backend`, Express, or a hand-rolled server equally easily.
