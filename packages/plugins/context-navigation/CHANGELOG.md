# @equinor/fusion-framework-plugin-context-navigation

## 1.0.0-next.0

### Patch Changes

- e8aae1f: Internal: publish every package on the `next` pre-release tag so the whole framework can be installed as a coherent set.

  Packages without their own changes are bumped only to receive a `-next.N` version and the `next` dist-tag on npm. Install with:

  ```bash
  pnpm add @equinor/fusion-framework-react-app@next
  ```

- Updated dependencies [e8aae1f]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
  - @equinor/fusion-framework-module@6.1.3-next.0
  - @equinor/fusion-framework-module-app@8.1.0-next.0
  - @equinor/fusion-framework-module-context@9.0.0-next.0
  - @equinor/fusion-framework-module-event@6.1.0-next.0
  - @equinor/fusion-framework-module-navigation@7.0.8-next.0

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
