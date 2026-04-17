---
"@equinor/fusion-framework-module-context-navigation": minor
---

Add new `@equinor/fusion-framework-module-context-navigation` module for synchronizing context state with browser URL.

This module provides a framework-level solution for keeping context identifiers in sync with the browser URL, replacing ad-hoc portal-side subscription logic. Key features:

- **Strategy adapters** — pluggable URL strategy adapters for `query` (`$contextId` param), `path` (legacy segment), and `custom` (app-controlled) routing modes.
- **Navigation orchestrator** — resolves the active routing strategy from the loaded app's context module and dispatches navigation through the correct adapter.
- **App-switch carry-over** — automatically appends the current context identifier when navigating to a new app route.
- **URL guard** — watches for URL changes that accidentally drop the context parameter and silently re-applies it via `replace`.
- **Source factories** — composable RxJS source factories (`createAppFirstSource`, `createContextFirstSource`) that drive the context-to-URL subscription.
- **Telemetry integration** — optional event tracking for context changes, app switches, and custom strategy detection.

Enable with `enableContextNavigation(configurator)` in portal configuration.
