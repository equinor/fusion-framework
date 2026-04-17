---
"@equinor/fusion-framework-module-context": minor
---

Add configurable `ContextRoutingStrategy` with `query`, `path`, and `custom` modes for context-aware deep links.

The context module now supports a `routingStrategy` configuration field that controls how context identifiers are resolved from and written to URLs:

- **`query`** (recommended) — uses the `$contextId` query parameter. Resolution tries query-string first, then falls back to path extraction.
- **`path`** — legacy path-segment strategy. Resolution tries path extraction first, then falls back to query-string.
- **`custom`** — app-controlled URL shape using custom `extractContextIdFromPath` / `generatePathFromContext` hooks.

The `generatePathFromContext` callback now receives the active `routingStrategy` as a third argument so host integrations can produce strategy-appropriate URLs.

When no strategy is explicitly configured, the module defaults to `query` and emits a console warning prompting explicit configuration.
