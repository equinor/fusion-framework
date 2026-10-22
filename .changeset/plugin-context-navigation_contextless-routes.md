---
"@equinor/fusion-framework-plugin-context-navigation": minor
---

Treat the URL as the source of truth for apps with custom context path hooks, so routes without context are no longer redirected.

- A route where `extractContextIdFromPath` finds no context is a route without context. The URL guard no longer puts the active context back into it, and clearing context on it keeps the user on that route instead of opening the app root.
- A route where `extractContextIdFromPath` finds a context that is not active now applies that context in both push and replace mode, also when no context is active. Apps no longer need to set context from the URL themselves after linking from a route without context.
- The URL guard treats the URL as in sync when encoding the active context yields the current path, so apps that use a key or slug in the URL no longer resolve context again on every navigation.
- Adapters can set the new optional `appOwnsUrl` flag to opt into this behavior. The built-in custom adapter sets it.

Fixes App Admin and Help Admin redirecting from list pages back to the previous application or to the app start page.

Refs: https://github.com/equinor/fusion-core-tasks/issues/2521
