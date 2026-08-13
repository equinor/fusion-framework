# @equinor/fusion-openapi-mock

Fakes OpenAPI 3 responses straight from a spec document, so testing an API-shaped client needs no hand-written mock data until a specific edge case needs one.

## When to use this package

- You have an `openapi.json`/`openapi.yaml` for a service and want a test double that already matches its shape, without writing fixtures by hand.
- You want most operations faked automatically, but a handful overridden for specific test scenarios (a `404`, a particular id, a boundary value).
- You want to wire generated mocks into an HTTP mock router (e.g. `@equinor/fusion-framework-module-http`'s `mock` entry point), `openapi-backend`, Express, or a hand-rolled server — this package has no opinion on any of them.

## Installation

```bash
pnpm add @equinor/fusion-openapi-mock
```

## Quick start

```ts
import { createOpenApiMock, fetchOpenApiDocument } from '@equinor/fusion-openapi-mock';

// Fetch the spec straight from wherever it's published — most are already public,
// so there's no point downloading a copy and committing it to the repository.
const openapi = await fetchOpenApiDocument('https://api.example.com/openapi.json');
const mock = createOpenApiMock(openapi);

const response = await mock.resolve({ method: 'GET', path: '/pets/1' });
// response.status -> the operation's declared success status
// response.mock   -> a value shaped like the operation's response schema
// response.params -> { petId: '1' }, extracted from the /pets/{petId} template
```

A document already available locally works the same way, with no need for `fetchOpenApiDocument`:

```ts
import openapi from './openapi.json' with { type: 'json' };

const mock = createOpenApiMock(openapi);
```

## Key concepts

### Fetching the spec instead of committing it

`fetchOpenApiDocument(url, options?)` fetches and parses a spec — JSON or YAML — from a URL, so a test suite always mocks against the real, currently-published contract instead of a copy that can drift out of sync. Pass a custom `fetch` (e.g. one that attaches an auth header) through `options.fetch`.

### Zero-friction baseline

Every operation with an `operationId` is indexed from the document's `paths`. The first time it's requested, its declared "success" response (the lowest `2xx` status code, falling back to `default`) is faked from that response's JSON schema — `$ref`s included, resolved against the same document.

### Overriding an edge case

Pass `overrides` at construction, or call `.register(operationId, handler)` afterwards, to replace the faked response for one operation:

```ts
const mock = createOpenApiMock(openapi, {
  overrides: {
    getPetById: ({ params }) => ({
      status: 404,
      mock: { message: `Pet ${params.petId} not found` },
    }),
  },
});
```

An override can also start from the generated baseline and tweak just the field a test cares about:

```ts
mock.register('getPetById', async ({ params, mockResponseForOperation }) => {
  const baseline = await mockResponseForOperation();
  return { ...baseline, mock: { ...baseline.mock, id: params.petId, status: 'sold' } };
});
```

### Repeatable tests with `seed`

```ts
const mock = createOpenApiMock(openapi, { seed: 42 });
```

The same document and seed always fake the same values, so a test can assert against a concrete expected value instead of `expect.any(...)`.

### Faking specific fields with `@faker-js/faker`

Add a `faker: "module.method"` keyword to any property in the OpenAPI schema (this package's own extension to the schema, ignored by every OpenAPI tool that doesn't know about it) to get a realistic value instead of a generic one:

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string", "faker": "person.fullName" },
    "email": { "type": "string", "faker": "internet.email" }
  }
}
```

Everything else — `format`, `pattern`, ranges, `enum`, composition keywords — is faked by `json-schema-faker`'s own built-in generators.

### Faking fields without editing the schema, via a `fields` sidecar

The `faker: "..."` keyword above requires editing the schema — not always possible when a spec is fetched from a URL and isn't yours to change. `fields` describes the same thing from the outside, keyed `"<ModelName>.<field>"` against `#/components/schemas` names instead:

```ts
const mock = createOpenApiMock(openapi, {
  fields: {
    'User.email': 'internet.email', // a faker path — same lookup as the schema keyword
    'User.avatarUrl': 'image.avatar',
    'User.id': ({ modelName, path }) => `usr_${modelName}_${path.join('-')}_${crypto.randomUUID()}`,
  },
});
```

A nested (inline, non-`$ref`) field dots further — `'User.address.city'`. Once a nested field is itself a named component schema, its own fields key off *that* schema's name instead (`'Address.city'`, not `'User.address.city'`), since that's the model a real `$ref` in the spec actually points at.

Build the map in code, or load it from a **sidecar file** with `loadFakerMap` — so the mapping lives next to your tests instead of inside the spec. `loadFakerMap` reads from disk and, for a `.ts`/`.js` sidecar, shells out to `esbuild`, so it lives at the separate `@equinor/fusion-openapi-mock/node` entry point — importing it from there instead of the main entry point keeps `node:fs`/esbuild out of a browser (or browser-mode Vitest) bundle that only ever calls `createOpenApiMock` with an already-built map:

```ts
import { createOpenApiMock } from '@equinor/fusion-openapi-mock';
import { loadFakerMap } from '@equinor/fusion-openapi-mock/node';

const fields = await loadFakerMap('./fields.faker.ts');
const mock = createOpenApiMock(openapi, { fields });
```

In a browser (or browser-mode Vitest) test, import the sidecar file directly instead — it's a
plain ESM module once it holds no Node-only code:

```ts
import { createOpenApiMock } from '@equinor/fusion-openapi-mock';
import fields from './fields.faker';

const mock = createOpenApiMock(openapi, { fields });
```

`loadFakerMap` resolves the sidecar by extension:

| Format | Can hold |
| --- | --- |
| `.json` | Faker-path strings only |
| `.yml` / `.yaml` | Faker-path strings only |
| `.ts` / `.js` / `.mjs` | Faker-path strings **and** real functions — its `default` export is used as the map, resolved through [`@equinor/fusion-imports`](../imports)' `importConfig`, so no build step is required |

```ts
// fields.faker.ts
import type { FieldFakerMap } from '@equinor/fusion-openapi-mock';

export default {
  'User.email': 'internet.email',
  'User.id': ({ path }) => `usr_${path.join('-')}`,
} satisfies FieldFakerMap;
```

`loadFakerMap` also accepts an already-built map (returned as-is), so code that builds one dynamically doesn't need a file at all.

## API reference

| Export                  | Description |
| ------------------------ | ----------- |
| `createOpenApiMock(document, options?)` | Builds an `OpenApiMock` for one parsed OpenAPI document. `options.seed` makes faked output repeatable, `options.fields` applies a `FieldFakerMap`. |
| `OpenApiMock.resolve({ method, path, query? })` | Matches a request against the document's paths, returning `{ status, mock, operationId, params }` or `undefined`. |
| `OpenApiMock.mockResponseForOperation(operationId)` | Fakes a response for one operation directly, ignoring request matching. |
| `OpenApiMock.register(operationId, handler)` | Registers (or replaces) the override for one operation. |
| `fetchOpenApiDocument(url, options?)` | Fetches and parses a JSON or YAML OpenAPI document from a URL. |
| `dereferenceSchema(schema, document)` | Inlines every `$ref` JSON pointer in a schema against a document. |
| `generateMockFromSchema(schema, options?)` | Fakes one value from an already-dereferenced schema. `options.seed` makes it repeatable. |
| `applyFieldFakers(schema, document, fields)` | Dereferences a schema while annotating fields matched by a `FieldFakerMap`; used internally by `createOpenApiMock`'s `fields` option. |
| `loadFakerMap(source, options?)` (from `@equinor/fusion-openapi-mock/node`) | Loads a `FieldFakerMap` from a `.json`/`.yml`/`.yaml`/`.ts`/`.js` sidecar file, or returns an already-built map as-is. Node-only — see the sidecar-file section above. |

## Notes

- Operations without an `operationId` are not routable or overridable — they're skipped entirely, since there's nothing to key an override on.
- A path parameter (`{petId}`) always matches exactly one path segment, matching OpenAPI's own path templating.
- A schema that (indirectly) references itself would recurse forever when faked; the second time one `$ref` is seen along a branch, `dereferenceSchema` substitutes an empty (permissive) schema instead.
