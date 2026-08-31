# @equinor/fusion-framework-plugin-context-navigation

## 1.0.2

### Patch Changes

- d333151: Internal: publish every package on the `next` pre-release tag so the whole framework can be installed as a coherent set.
  
  Packages without their own changes are bumped only to receive a `-next.N` version and the `next` dist-tag on npm. Install with:
  
  ```bash
  pnpm add @equinor/fusion-framework-react-app@next
  ```
- 2899c8a: Internal: rebase `next` onto `main`, syncing in already-published stable releases so they carry a `next` pre-release tag.

## 1.0.2-next.0

### Patch Changes

- c8008e3: Internal: rebase `next` onto `main`, syncing in already-published stable releases so they carry a `next` pre-release tag.
- Updated dependencies [c8008e3]
  - @equinor/fusion-framework-module-app@8.0.6-next.0
  - @equinor/fusion-framework-module-navigation@7.0.9-next.0

## 1.0.1

### Patch Changes

- d64448c: Fix the path adapter to preserve the app's sub-route when the context changes, instead of always resetting to the app root. The sub-route is still dropped when context is cleared entirely, since there's no valid context to resolve it against.

  Fixes: https://github.com/equinor/fusion/issues/904

## 1.0.0

### Major Changes

- 3e84250: Add `requireValidContext` option to gate reconciliation on the app's context validation.

  When enabled, the reconciler and URL guard validate the current context against the app's context module (`IContextProvider.validateContext`) before encoding it into the URL. If validation fails, navigation is skipped and an `onContextNavigationSkipped` event is dispatched with reason `invalid-app-context`.

  ```typescript
  enableContextNavigation(configurator, (builder) => {
    builder.setRequireValidContext(true);
  });
  ```

  Defaults to `false`, so existing consumers are unaffected unless they opt in.

  **Breaking change:** `ContextNavigationSkippedDetail['reason']` gains a new member, `'invalid-app-context'`. Consumers with an exhaustive `switch` or `assertNever` over this union must add a case for it (or a `default` branch) before upgrading.

  ```typescript
  switch (detail.reason) {
    case "url-matches":
    case "no-context":
    case "no-adapter":
    case "encode-returned-null":
    case "canceled":
      // ...
      break;
    case "invalid-app-context": // new — add this case
      // ...
      break;
  }
  ```

## 0.1.2

### Patch Changes

- 73bfe52: Fix `createPathAdapter` matching on non-app routes. `canHandle` now rejects a URL when `currentURL.pathname` does not parse as a valid app route (e.g. portal chrome), preventing the path adapter from incorrectly claiming ownership of URLs where there is no app route to encode context into.

## 0.1.1

### Patch Changes

- f6e9814: Internal: build the package before `prepack` so packed and published artifacts always include fresh generated output.

## 0.1.0

### Minor Changes

- 1b9d026: Initial release of the context navigation plugin.

  Adapter-based, event-driven plugin that reconciles context selection with the browser URL for portal hosts. Ships with built-in adapters for query-param, path-segment, and custom URL shapes, plus two pre-wired source strategies:

  - **app-first** — app sets context, the plugin encodes it to the URL.
  - **context-first** — the plugin decodes context from the URL on startup, redirects to a configurable null-context URL when no context is resolvable.

  ```ts
  import { enableContextNavigation } from "@equinor/fusion-framework-plugin-context-navigation";
  import { createAppFirstSource } from "@equinor/fusion-framework-plugin-context-navigation/sources";

  enableContextNavigation(configurator, (builder) => {
    builder.setSourceFactory(createAppFirstSource());
  });
  ```

### Patch Changes

- 593a44b: Internal: bump `vitest` from `^3.1.1` to `^4.1.10` (dev dependency, test runner only), matching the version already used across the rest of the monorepo.
