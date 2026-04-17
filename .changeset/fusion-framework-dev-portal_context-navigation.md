---
"@equinor/fusion-framework-dev-portal": minor
---

Integrate `context-navigation` module replacing ad-hoc context URL synchronization.

The dev-portal now uses `@equinor/fusion-framework-module-context-navigation` for all context-to-URL synchronization, replacing the previous `useAppContextNavigation` hook and inline subscription logic. Context URL hooks are extracted to `config-context.ts` for clarity.

Enables console debug logging, telemetry tracking, custom strategy warnings, and app-switch carry-over by default.
