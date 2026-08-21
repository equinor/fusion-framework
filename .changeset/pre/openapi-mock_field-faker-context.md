---
"@equinor/fusion-openapi-mock": minor
---

`FieldFakerFn` (used in `createOpenApiMock`'s `fields` option and `loadFakerMap` sidecars) is now called with a `faker` property alongside `modelName` and `path` — the same seeded `@faker-js/faker` instance generating the rest of the response, so a custom field faker stays deterministic under `OpenApiMockOptions.seed` too, instead of reaching for its own unseeded `@faker-js/faker` import.

```typescript
const mock = createOpenApiMock(openapi, {
  seed: 42,
  fields: {
    'User.id': ({ faker }) => faker.string.uuid(),
  },
});
```

Internal: reorganized `src/` into `lib/`/`utils/` folders and moved tests to `src/__tests__/`, with no other change to the public API.
