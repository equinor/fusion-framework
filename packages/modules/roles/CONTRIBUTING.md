# Maintaining the Roles module

Package-local guide for contributors. Consumer usage belongs in [README.md](./README.md);
operator-level reasoning belongs beside the implementation in TSDoc and intent comments.
Follow the repository [agent guide](../../../AGENTS.md) and its instruction routing.

## Ownership boundaries

| Surface | Responsibility |
| --- | --- |
| [RolesModuleConfigurator](./src/RolesModuleConfigurator.ts) | Resolve configuration, await authentication initialization, retain the auth provider, select a custom client or create one through `rolesv2` service discovery. |
| [Module initializer](./src/module.ts) | Initialize the client, attach optional event/telemetry dependencies, construct the provider, assert configured role requirements. |
| [RolesClient](./src/RolesClient.ts) | Cold observable operations, typed `@equinor/fusion-services/roles` transport, account-isolated Query caches, bounded required-role transforms. |
| [RolesProvider](./src/RolesProvider.ts) | Promise conversion, consumer-driven async pagination, claim veto events, domain errors, privacy-safe operation telemetry, client disposal. |
| [RolesMockConfigurator](./src/mock/RolesMockConfigurator.ts) | Replace transport with static client data while exercising the production initializer and provider. |

Do not move generators or Promise conversion into the client. Do not move HTTP response schemas
into this package: use the versioned service contracts. UI recovery belongs to host/React consumers,
not the transport client. Client-side role checks never replace backend authorization.

## Contracts to preserve

- **Authentication:** await the provider during configuration so initialization failures are observed.
  Read its current account per operation, not once during setup. Configuration can succeed without
  a selected account; account-dependent operations cannot. Retain the provider rather than querying
  a potentially failed module registry during recovery.
- **Observable lifecycle:** operations are cold and emit one result before completing, or error.
  `defer` owns per-subscription state and captures synchronous failures. No internal subscriptions,
  silent error-to-empty fallbacks, or automatic mutation retries. Two mutation subscriptions can
  execute two requests; transport cancellation cannot undo a server-accepted mutation.
- **Caching:** active and consolidated claimable reads are keyed by account; eligibility adds the
  access-role name. Query owns the minute-long cache and concurrent-read coordination. Explicit
  refresh invalidates before reading; successful claims/deactivations invalidate all three caches.
  Failed mutations leave cached data intact.
- **Public pagination:** client `getAccessRoles({ top, skip }, signal)` emits one service page with
  continuation metadata. Provider `getAccessRoles(signal)` yields arrays through an async generator,
  requesting the next page only when advanced. No prefetching or full-registry buffering. `break`
  prevents subsequent requests; abort cancels a pending request. Reject non-advancing continuations.
- **Unpaged collections:** active roles and consolidated claimable roles remain Promise-based arrays
  at the provider boundary. Do not invent pagination for endpoints that return unpaged arrays.
- **Required-role lookup:** scan only until all requested names are found or the registry ends;
  retain matching roles, not the entire registry. Preserve unique request order, service assignment
  order, and display-name fallbacks. Missing assignment IDs cannot produce activatable claims.
- **Error recovery:** preserve service errors as causes. Required-role errors retain missing names
  and provider recovery operations, and support structural recognition across separately bundled
  class copies. Claim cancellation must prevent the activation request.
- **Telemetry:** use stable operation names and outcomes; do not add account IDs, role names,
  claim reasons, tokens, or response payloads to operation properties.

## RxJS review checklist

Read the comments on the changed pipeline before replacing operators.

| Pipeline | Why the operator choice matters |
| --- | --- |
| Account -> request | The resolver emits once; `switchMap` connects that result to its request and propagates teardown. It is not an account-change subscription. |
| Mutation -> invalidation | Success-only `tap` preserves the result and invalidates before downstream consumers refresh. |
| Required-role join | `forkJoin` needs both finite branches to emit and complete; errors unsubscribe sibling work. Do not start detached Promises. |
| Claim indexing | `concatMap` flattens assignments/mappings in order; guards filter unusable/unrequested records; `map` creates claims; seeded `reduce` emits one index, including an empty one. Allocate its mutable seed inside `defer`. |
| Bounded registry scan | `expand` follows page offsets; `EMPTY` ends expansion; `last` prevents partial indexes escaping. This internal finite lookup is not the public listing API. |
| Provider iteration | `lastValueFrom` converts one page at a time; `takeUntil` releases even custom transports that ignore the signal. Completion without a page must not masquerade as a successful registry end. |

An empty array/map is a result; `EMPTY` is not interchangeable with it. Changes to sharing,
completion, operator ordering, or accumulator allocation need regression tests, not just type checks.
Keep detailed explanations at the affected operators rather than duplicating implementation walkthroughs here.

## Validation

Run from the repository root; use the smallest relevant tests first. Browser consumers resolve built
package output, so rebuild this module before testing those consumers.

```sh
pnpm --filter @equinor/fusion-framework-module-roles exec tsc -b
pnpm exec vitest run --project '*module-roles*'
pnpm exec biome check packages/modules/roles/src
pnpm exec fusion-lint lint packages/modules/roles/src
```

When the client/provider contract changes, include the existing React hook integration:

```sh
pnpm exec vitest run --project '*module-roles*' --project '*react-app*' \
  packages/modules/roles/src/__tests__ \
  packages/react/app/src/__tests__/useRole.test.tsx
```

Cover lazy execution, account switching, cache isolation/invalidation, failed auth initialization,
empty/malformed results, independent subscriptions, mapping order, sibling teardown, later-page
failure, early exit, and abort. Update custom client fixtures and the static mock when changing
`IRolesClient`; provider consumers should not need to understand client transport operators.

Use scoped imports, explicit exported types, TSDoc, and existing Vitest/Biome/Fusion lint tooling.
Record package behavior changes in a changeset; this contributor guide alone is repository-internal
documentation and does not require a consumer documentation release.
