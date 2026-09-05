# Maintaining role components

This is a new package awaiting its initial release. Keep consumer setup and contracts in the
[README](./README.md), and portal adoption steps in the [migration guide](./docs/migration.md).
The package root remains the public API. Internal feature folders are not package exports.

## Ownership boundaries

- [RolesView](./src/components/RolesView.tsx) selects the application or compact presentation.
- [application/](./src/components/application/) owns assignment cards and the two-tab application layout.
- [compact/](./src/components/compact/) owns narrow rows, information dialogs, and the three-tab layout. Pure grouping
  and formatting helpers accept a snapshot time so expiry decisions can be tested deterministically.
- [overview/](./src/components/overview/) adapts provider collections for both layouts and coordinates selection, activation,
  deactivation, and reload. It does not decide layout or authorization.
- [claim/](./src/components/claim/) owns the audit form and submission lifecycle for all activation entry points.
- [required-access/](./src/components/required-access/) owns pre-mount access checks, role-error recovery, and its outcome views.
- [context/](./src/context/) binds one module provider to a store lifetime, refresh listeners, and expiry history.
- [hooks/](./src/hooks/) projects context state and stable actions; it does not duplicate fetching or storage.
- [state/](./src/state/) owns action correlation, collection state, and RxJS operation lifetimes.
- The Roles module owns transport, current-account resolution, caching, claim events, and module disposal.
  React code consumes `IRolesProvider`; it must not create another service client or dispose the module provider.

Keep styles in a component-local `Styled` object. Extract a cohesive component or controller when
responsibilities diverge; do not introduce a feature-wide style dump or split solely by line count.

## Provider and store lifecycle

[RolesProvider](./src/context/RolesProvider.tsx) resolves the module through `useModule('roles')` and
validates its collection, mutation, and access-check methods before creating state. This is the React
component, not the same-named class exported by the Roles module.

A provider identity change resets the scope **during render**, with a generation key. Do not move
this reset into an effect: stale collections, dialog state, and child effects must not commit under
the new provider. The keyed subtree owns its store, expiry queue, previous snapshot, and suppression
map. Identity is the lifetime boundary; do not claim that a mutable account change on the same module
provider automatically creates a new React scope.

[RolesProviderScope](./src/context/RolesProviderScope.tsx) starts both collection reads in an effect.
StrictMode can immediately replay that effect using the same store, so terminal disposal is deferred
to a microtask and guarded by a lifecycle generation. A replay reclaims the store; a genuine unmount
or provider replacement disposes it. Discarding a rendered-but-uncommitted scope must not start reads
or register browser listeners.

[RolesStore](./src/state/RolesStore.ts) is terminal after `dispose()`. Disposal unsubscribes the
registered flow before completing the base observable lifecycle. `complete()` and `unsubscribe()`
use the same disposal path. Pending imperative operations reject rather than hang, post-disposal
operations reject before dispatch, and late provider results cannot update disposed state.
Unsubscribing does not abort a provider promise or guarantee that a submitted server mutation was canceled.

## Refresh and error contracts

- Active and claimable collections start in `loading` with empty arrays, then settle independently.
- Starting a read clears that collection's error but retains its assignments. Failure retains the last
  snapshot; a failed read is not an empty result and must not be presented as revoked access.
- Hook `reload()` forces refresh of only its collection. It resolves on that request's success **or
  failure**; callers inspect hook `error`. It rejects on disposal, including callbacks retained after unmount.
- Initial reads allow module caching. Automatic refreshes force both collections every 60 seconds,
  on focus, and on visibility changes when the document is visible. A ref coalesces overlapping
  automatic triggers; it does not serialize explicit reloads or mutation calls.
- Browser listeners and the interval are scope-owned and removed on cleanup.
- A mutation failure rejects its caller and populates the matching `claimError` or `deactivateError`.
  A successful mutation starts both collection refreshes and settles only after both attempts finish.
  Read failures populate collection errors without converting a committed mutation into a failure.
- Mutation pending counters include post-mutation refreshes. Concurrent operations settle independently;
  shared mutation errors are not per-assignment error maps and are cleared when another mutation of that kind starts.
- The overview distinguishes initial loading from later refreshes, including for an empty account.
  Background reads and collection failures must not unmount an open audit form or erase its input.

### RxJS operator and correlation contracts

The relevant implementation is [create-roles-flow](./src/state/create-roles-flow.ts),
[refresh-roles-after-mutation](./src/state/refresh-roles-after-mutation.ts), and
[create-roles-reducer](./src/state/create-roles-reducer.ts).

| Mechanism | Contract to preserve |
| --- | --- |
| `defer` | Invoke provider methods at subscription time so synchronous throws enter the same error channel as promise rejections. |
| `filter` and operation IDs | Subscribe to the matching terminal action before dispatch; one imperative caller must not settle on another caller's result. |
| `firstValueFrom` and `throwIfEmpty` | Resolve one correlated outcome; reject if the action stream completes before it arrives. |
| Read `mergeMap` | Let every read settle independently. Replacing it with `switchMap` can abandon callers waiting for a terminal action. |
| Reducer operation-ID equality | Only the request currently owning a collection may update its state. Superseded requests still emit outcomes for their own callers. |
| Inner `catchError` | Turn a provider failure into an action without terminating the shared action stream or preventing later retries. |
| Mutation `mergeMap` | Preserve concurrent calls and their pending counts; it is not a duplicate-submission lock or ordering guarantee. |
| `concat` after mutation | Emit refresh-start, then collection outcomes, then mutation success; never report success before both reads settle. |
| Per-collection `merge` and `catchError` | Publish a fast collection without waiting for its sibling; failure in one read must not discard the other's result. |
| Flow unsubscription | Cancel observation of in-flight work on disposal; completion alone does not tear down active inner subscriptions. |

Operation IDs are correlation tokens, not timestamps or a global server-write ordering guarantee.
A refresh-start action installs the collection owners for that refresh. Preserve both ownership checks
and per-request settlement when changing overlap behavior. Post-mutation reads rely on the module/client's
mutation cache invalidation rather than issuing a second forced invalidation from the React layer.
An injected provider must preserve that read-after-mutation contract.

## Access and recovery invariants

- `RequiredRoleGate` associates a successful check with **both** its requirements and provider
  during render. An effect-only reset is too late: unchecked child effects could already mount.
- Equivalent normalized requirement arrays do not restart checks. Required values are access-role names,
  while mutations use claimable assignment IDs; do not substitute role-definition IDs or display labels.
- This is a pre-mount UI gate, not continuous access enforcement. Collection polling does not invalidate
  a successful gate. Backend authorization is required even when the UI displays active access.
- `RoleBoundary` handles role failures, including a `RequiredRolesError` found through a cause chain,
  and rethrows unrelated errors. Without requirements it is recovery-only, not a hook context provider.
- Bootstrap recovery belongs around the host loader, since the application's own provider has not
  mounted yet. `useRoleRecovery` uses the provider attached to the original error, never the portal
  overview's provider. Guard metadata and activation completions against replaced error/request identity.
- Metadata read failure remains a visible service error with local retry. It must not become a
  nonexistent-role or not-claimable verdict, and metadata retry must not restart the host.
- Only successful activation for the current recovery request invokes the boundary retry callback.
  This path calls the error's module provider directly; it does not promise the overview store's
  coordinated collection refresh.
- Compact Expired contains at most three eligible shortcuts, newest first. Only those displayed
  assignments leave Claimable. Active claimable assignments intentionally also remain in Claimable,
  where users can deactivate them; the Active tab is informational.
- Expired eligibility uses a seven-day activation-expiry window plus entitlement bounds:
  `validFrom <= now` and `validTo > now` when supplied. Missing bounds are unconstrained metadata;
  malformed supplied bounds exclude a shortcut rather than silently granting unlimited eligibility.
  A valid activation expiry is always required. Keep selection separate from date label formatting.
- [parseRoleDate](./src/dates/parse-role-date.ts) uses `date-fns` ISO parsing for labels, grouping,
  and expiry recovery. Missing, malformed, and valid dates remain distinct; comparisons use only valid
  timestamps. Preserve UTC interpretation for date-only values and local interpretation for offsetless
  date-times.
- Compact labels retain browser-local `Intl.DateTimeFormat`. `No expiration date` means missing metadata;
  `Invalid expiration date` means malformed metadata. Neither is an authorization statement. Do not
  replace presentation with `DateTime`'s default `enGB` locale without an explicit consumer-facing decision.
- Claim callbacks reject on failure. `useRoleClaimForm` displays the rejection, retains audit input,
  and prevents duplicate submission. Recovery retries the host only after activation succeeds.
- Selecting a different claim resets reason, duration, and error. Pending controls remain disabled;
  errors are owned by the dialog because React boundaries cannot catch event-handler rejections.

### In-place expiry ownership

[useExpiredRoleRecovery](./src/context/useExpiredRoleRecovery.ts) observes **successful claimable
snapshots only**. Loading and error snapshots do not consume transitions. It queues assignments that
transition from active to inactive, or remain marked active with a parsable expiry already elapsed.
It is refresh-driven, not a per-assignment timer or a second service-eligibility check.

Every queued activation period is suppressed immediately to prevent duplicate prompts on later reads.
Dismissal advances one entry; successful reclaim removes that assignment without resetting the application.
A newly observed activation can clear suppression, allowing recovery of a later expiry. Intentional
deactivation suppresses before the mutation starts and rolls back only on mutation rejection; a later
collection failure must not undo that suppression. Rollback checks entry identity so an older request
cannot overwrite newer suppression ownership. A module provider replacement clears the whole history.

## Validation

Build the package and its referenced dependencies before browser tests, because workspace imports
resolve published `dist` entry points:

```sh
pnpm --filter @equinor/fusion-framework-react-components-roles build
pnpm exec vitest run --project '*react-components-roles*'
pnpm exec biome check packages/react/components/roles
pnpm exec fusion-lint lint packages/react/components/roles
pnpm verify:package-exports
pnpm --filter @equinor/fusion-framework-react-components-roles pack --pack-destination /tmp/roles-package-check
```

Tests stay beside their feature. UI tests cover behavior through `RolesView`, `RoleBoundary`, and
provider-driven recovery; pure derivation tests cover expiry boundaries and absent metadata.

When changing these contracts, cover:

- StrictMode replay, genuine unmount, pending-operation disposal, and provider replacement;
- overlapping reads that settle their own promises without publishing superseded results;
- independent collection failures, synchronous provider throws, and successful mutation with failed refresh;
- claim/deactivate pending counters and explicit handling of rejected event-handler promises;
- focus/visibility refresh while audit input is open, including empty and failed snapshots;
- required-role changes before child effects mount, metadata retry, and stale recovery completions;
- simultaneous expiries, per-period dismissal, intentional deactivation rollback, and later reactivation;
- compact overflow beyond three shortcuts and optional IDs, dates, scope, and role metadata.

Inspect the actual packed archive: it must contain the ESM/type entry points, README, migration guide,
and all eight referenced screenshots, but no source, tests, workspace config, or obsolete emitted files.
Package `files` and the exception in `.github/scripts/verify-package-exports.mjs` must agree.

Consumer README or migration changes require a docs changeset. Internal maintainer-only notes do not.
Keep the initial-release changeset scoped to the new package rather than describing an upgrade from a
nonexistent published version. Publication contents, release readiness, and date-utility decisions
must be verified separately from documentation edits.
