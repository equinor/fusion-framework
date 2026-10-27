# @equinor/fusion-framework-plugin-context-navigation

## 1.1.0

### Minor Changes

- e9838fb: Treat the URL as the source of truth for apps with custom context path hooks, so routes without context are no longer redirected.
  
  - A route where `extractContextIdFromPath` finds no context is a route without context. The URL guard no longer puts the active context back into it, and clearing context on it keeps the user on that route instead of opening the app root.
  - A route where `extractContextIdFromPath` finds a context that is not active now applies that context in both push and replace mode, also when no context is active. Apps no longer need to set context from the URL themselves after linking from a route without context.
  - The URL guard treats the URL as in sync when the app's path generator writes the URL's key or slug for the active context, so apps that use a key or slug in the URL no longer resolve context again on every navigation. A generator that returns the path unchanged is not taken as proof, so moving between two contexts still resolves the new one.
  - The URL guard resolves context from the URL with the cancelable `setCurrentContextById` and cancels the lookup when the user navigates elsewhere, dismisses or switches apps, or app modules become unresolved, so a late result neither changes the context nor redirects. Cancellation does not depend on the destination having resolved modules or context support.
  - Keys or slugs repeated in unrelated route segments no longer cause redundant context lookups.
  - Adapters can set the new optional `appOwnsUrl` flag to opt into this behavior. The built-in custom adapter sets it.
  
  Fixes App Admin and Help Admin redirecting from list pages back to the previous application or to the app start page.
  
  Refs: https://github.com/equinor/fusion-core-tasks/issues/2521

### Patch Changes

- 30d15f2: Respect explicit query context routing when custom path hooks are registered.
  
  Refs: https://github.com/equinor/fusion-core-tasks/issues/2264; https://github.com/equinor/fusion-framework/issues/5608

## 1.0.6

### Patch Changes

- 1aeab73: Internal: upgrade the test toolchain to Vitest 5 through the shared `vitest` pnpm catalog, keeping `vitest`, `@vitest/browser-playwright`, and `vitest-browser-react` aligned for browser-mode tests. Browser tests now use Vitest 5's explicit partial-text assertions and locator matching where needed.

## 1.0.5

### Patch Changes

- 9dfe760: Internal: declare the `repository` field so npm trusted publishing (OIDC) can attach
  provenance linking each release to `equinor/fusion-framework`.
  
  Ref: equinor/fusion-core-tasks#319.

## 1.0.4

### Patch Changes

- 0d1e372: Publish spec-compliant ESM that loads under native Node, not only through a bundler.
  
  Every package now declares `"type": "module"`, and every relative import in the emitted `dist/esm` carries an explicit `.js` extension. Previously, tools that hand dependencies to Node's ESM resolver — such as Vitest with externalized dependencies — failed with `ERR_MODULE_NOT_FOUND` on imports like `./FrameworkConfigurator`. Consumers can remove the `server.deps.inline: [/@equinor\/fusion-framework/]` Vitest workaround once on these versions.
  
  Bundled builds are unaffected; Vite, webpack, and Rollup resolve the explicit extensions as before.
  
  Ref: https://github.com/equinor/fusion/issues/959

## 1.0.3

### Patch Changes

- d04e564: Internal: restrict published package contents to compiled distribution files and required runtime artifacts so editor tooling does not load workspace TypeScript configurations from dependencies.

## 1.0.2

### Patch Changes

- f663b46: Internal: promote packages already published on the `next` prerelease channel to their stable versions.

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
