# @equinor/fusion-framework-plugin-context-navigation

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
