---
"@equinor/fusion-framework-module-context": minor
---

Add configurable `ContextRoutingStrategy` with `query` and `path` modes for context-aware deep links.

The context module now supports a `routingStrategy` configuration field that controls how context identifiers are written to URLs:

- **`query`** (recommended) — encodes context as the `$contextId` query parameter.
- **`path`** — encodes context as a path segment (legacy convention).

URL resolution (reading context from a URL) is always query-first: the plugin checks `$contextId` query param first, then falls back to path-segment extraction regardless of the declared strategy.

Apps with custom URL shapes should use `setContextPathExtractor` / `setContextPathGenerator` hooks directly — the context navigation plugin's custom adapter picks up those hooks automatically without requiring a separate strategy value.

The `generatePathFromContext` callback now receives the active `routingStrategy` as a third argument so host integrations can produce strategy-appropriate URLs.

When no strategy is explicitly configured, the module defaults to `path` for backward compatibility and logs a console warning encouraging explicit configuration.

**Deprecations:** `resolveContextFromPath` utilities are deprecated in favour of `@equinor/fusion-framework-plugin-context-navigation`, which handles URL-to-context reconciliation via adapters. `resolveInitialContext` has been simplified to only resolve from the parent context — URL-based resolution is now handled by the plugin. `extractContextIdFromPath` remains supported — it is the default extractor used by `setContextPathExtractor` and the custom adapter fallback.
