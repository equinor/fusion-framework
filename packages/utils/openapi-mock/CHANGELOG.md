# @equinor/fusion-openapi-mock

## 0.2.0-next.1

### Minor Changes

- 306973d: `FieldFakerFn` (used in `createOpenApiMock`'s `fields` option and `loadFakerMap` sidecars) is now called with a `faker` property alongside `modelName` and `path` — the same seeded `@faker-js/faker` instance generating the rest of the response, so a custom field faker stays deterministic under `OpenApiMockOptions.seed` too, instead of reaching for its own unseeded `@faker-js/faker` import.
  
  ```typescript
  const mock = createOpenApiMock(openapi, {
    seed: 42,
    fields: {
      'User.id': ({ faker }) => faker.string.uuid(),
    },
  });
  ```
  
  Internal: reorganized `src/` into `lib/`/`utils/` folders and moved tests to `src/__tests__/`, with no other change to the public API.

## 0.2.0-next.0

### Minor Changes

- 2836e0b: Add `@equinor/fusion-openapi-mock`: fakes OpenAPI 3 responses straight from a parsed spec document, so testing an API-shaped client needs no hand-written fixtures until a specific edge case needs overriding.

  ```typescript
  import {
    createOpenApiMock,
    fetchOpenApiDocument,
  } from "@equinor/fusion-openapi-mock";

  const openapi = await fetchOpenApiDocument(
    "https://api.example.com/openapi.json",
  );
  const mock = createOpenApiMock(openapi, { seed: 42 });

  const response = await mock.resolve({ method: "GET", path: "/pets/1" });
  // response.mock is already shaped like the operation's declared response schema
  ```

  Highlights:

  - Every operation with an `operationId` is faked from its declared success response schema, `$ref`s resolved against the document — no hand-written mock data needed to get started.
  - `overrides` (at construction) and `.register(operationId, handler)` (afterwards) replace the faked response for just the operations an edge case cares about.
  - `seed` makes faked output repeatable across runs, for assertions against concrete expected values instead of `expect.any(...)`.
  - `fetchOpenApiDocument(url, options?)` fetches and parses a JSON or YAML spec from a URL, so there's no need to download and commit a copy that can drift out of sync.
  - `fields`, a `FieldFakerMap` keyed `"<ModelName>.<field>"`, fakes specific fields with a `@faker-js/faker` path string or a real function — without editing the spec itself. `loadFakerMap(source)` (from `@equinor/fusion-openapi-mock/node`) loads one from a `.json`/`.yml`/`.yaml`/`.ts`/`.js` sidecar file (functions require `.ts`/`.js`), or accepts an already-built map. It is a separate, Node-only entry point (it shells out to `esbuild` to load `.ts`/`.js` sidecars) so importing `@equinor/fusion-openapi-mock` from browser-mode tests never pulls in Node-only code.
  - No dependency on any HTTP or routing framework: `resolve({ method, path, query })` returns a plain `{ status, mock }`, so it drops into `@equinor/fusion-framework-module-http`'s mock router, `openapi-backend`, Express, or a hand-rolled server equally easily.

### Patch Changes

- e8aae1f: Internal: publish every package on the `next` pre-release tag so the whole framework can be installed as a coherent set.

  Packages without their own changes are bumped only to receive a `-next.N` version and the `next` dist-tag on npm. Install with:

  ```bash
  pnpm add @equinor/fusion-framework-react-app@next
  ```

- Updated dependencies [e8aae1f]
  - @equinor/fusion-imports@2.0.3-next.0
