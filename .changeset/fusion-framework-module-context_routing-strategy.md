---
"@equinor/fusion-framework-module-context": minor
---

Add configurable `ContextRoutingStrategy` with `query` and `path` modes for context-aware deep links.

The context module now supports a `routingStrategy` configuration field that controls how context identifiers are resolved from and written to URLs:

- **`query`** (recommended) — uses the `$contextId` query parameter. Resolution tries query-string first, then falls back to path extraction.
- **`path`** — legacy path-segment strategy. Resolution tries path extraction first, then falls back to query-string.

Apps with custom URL shapes should use `setContextPathExtractor` / `setContextPathGenerator` hooks directly — the context-navigation-handler module's custom adapter picks up those hooks automatically without requiring a separate strategy value.

The `generatePathFromContext` callback now receives the active `routingStrategy` as a third argument so host integrations can produce strategy-appropriate URLs.

When no strategy is explicitly configured, the module defaults to `query` and logs a console warning prompting explicit configuration.

**Deprecations:** `resolveContextFromPath` and `resolveInitialContext` utilities are deprecated in favour of the new `context-navigation-handler` module which handles URL-to-context reconciliation via adapters. `extractContextIdFromPath` remains supported — it is the default extractor used by `setContextPathExtractor` and the custom adapter fallback.
