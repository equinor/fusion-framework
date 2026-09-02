---
"@equinor/fusion-services": minor
---

Add `@equinor/fusion-services` — tree-shakeable, function-based clients for Fusion platform services, starting with complete Fusion Roles V2 coverage.

Every operation published by the Roles V2 OpenAPI document (all 73) is exported as a standalone named function from `@equinor/fusion-services/roles`. There is no client class, so importing one operation bundles one operation.

```ts
import { getRole, listRoles } from '@equinor/fusion-services/roles';

const client = await modules.http.createClient('roles');

// Promise
const role = await getRole('v1', client)({ roleIdentifier: 'reader' });

// Observable
listRoles('v1', client, 'json$')({ top: 10 }).subscribe(console.log);
```

**Octokit-style version coupling.** The API version is an endpoint's single discriminator. Each endpoint declares one version contract keyed by the concrete version — `{ [ApiVersion.v1]: { args, response } }` — and the version a caller passes selects the request path, the `api-version` query parameter, the argument schema, and the response schema from that one entry.

The coupling holds at compile time as well: `GetRoleArg<'v1'>` and `GetRoleResponse<'v1'>` resolve through the contract entry for the selected version instead of collapsing to a version-neutral shape. A version can be named three ways — `'v1'`, `'1.0'`, or `ApiVersion.v1` — and all three infer the same types; anything else is a compile error, and a runtime guard throws `Version <x> is not supported` before the HTTP client is invoked.

Reusable schemas live in a version-scoped module graph (`src/roles/v1/schemas`) with matching symbol names (`ApiRoleSchemaV1`), so a schema written for API 1.0 cannot be reused by another version. Adding version 2.0 means adding a `src/roles/v2/` graph and a `[ApiVersion.v2]` contract entry — no version 1.0 definition is edited, and no runtime registry is consulted, so an unused version never reaches a bundle.

**Zod is the single source of truth for models.** There are no handwritten interfaces for API payloads. Each versioned schema module exports its schema and the type inferred from it — `export type ApiRoleV1 = z.infer<typeof ApiRoleSchemaV1>` — and the same rule covers requests, so `CreateRoleArg<'v1'>` is `z.input` of the version's argument schema. The direction of truth is Zod → TypeScript and cannot be reversed: TypeScript types are erased and cannot produce a validator. Model names carry the API version, so `ApiRoleV1` can never silently mean a future version's shape, and a v2 endpoint would return `ApiRoleV2` rather than a union or a reused v1 type. The types reach consumers through a type-only barrel, so re-exporting them pulls no schema module into a bundle.

Responses are validated with Zod before reaching the caller. Caller `init` is applied first and the generated defaults are layered on top, so a caller can add headers but can never override the version-specific response selector, or, for mutations, the contract's HTTP method and body.

**Documentation is generated from the contract.** Every endpoint function carries the OpenAPI summary of the operation it implements, its `METHOD /path`, the two-stage call shape, what the selected version decides, the success status code and body type, side effects for destructive operations, and a runnable example — so hover on `getRole` says it fetches a role by identifier rather than describing a currying helper. The four per-operation types (`GetRoleVersion`, `GetRoleArg`, `GetRoleResponse`, `GetRoleResult`) are declared under those names and documented in terms of their own endpoint, and every inferred model type carries the description the contract publishes for it. Three offline tests keep it that way: one asserts each of the 73 operations maps its OpenAPI summary into its public TSDoc with complete tags and a schema-valid example; one that no model type falls back to shared boilerplate; and one lexical retrieval probe that ranks a natural-language query such as `httpclient request service roles user` and requires the package entry point and the role and account assignment operations to outrank versioned schema internals.

**The OpenAPI contract ships with the package.** The complete published Roles API 1.0 document is checked in at `src/roles/v1/openapi.json` and exported as `@equinor/fusion-services/roles/v1/openapi.json`, so mock servers and code generators can consume the exact contract the endpoints were built from:

```ts
import rolesV1OpenApi from '@equinor/fusion-services/roles/v1/openapi.json' with { type: 'json' };
```

The subpath is versioned by the API version, which is independent of the package version; a future Roles API 2.0 gets `roles/v2/openapi.json` beside it. There is deliberately no unversioned alias.

Nothing is stripped — paths, all 118 component schemas, `security`, `components.securitySchemes`, `tags`, `servers`, and `info` are preserved. The only normalization is sorting object keys, so an upstream key reordering cannot register as a change; array order is untouched. TypeScript consumers need `resolveJsonModule` and an `exports`-aware `moduleResolution`.

**Contract drift detection.** `check:openapi <service>` (today `check:openapi roles`) diffs the live document against that snapshot and exits nonzero with a per-operation and per-schema summary without modifying the repository. Services and API versions are declared in a small registry (`scripts/openapi-services.ts`) that the single generic checker reads, so adding a service or a future API version does not touch the checker. Snapshot changes are reviewed and applied manually. The network-dependent check is deliberately kept out of `test`, `build`, and `lint`. The same exported snapshot supplies the operation inventory for the offline 73-operation completeness test, so the contract has a single source of truth.
