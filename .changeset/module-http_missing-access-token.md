---
"@equinor/fusion-framework-module-http": major
---

Scoped MSAL requests now reject with `MissingAccessTokenException` before fetch when token
acquisition returns no token or no auth module is registered. Previously these requests could
be sent anonymously. Unscoped requests and token acquisition errors are unchanged.

Migration: handle the rejection rather than relying on the anonymous fallback. For intentionally
anonymous endpoints, configure a client without `defaultScopes` and omit per-request scopes.
The exception is exported from the package root and `/errors`.

Refs: https://github.com/equinor/fusion-core-tasks/issues/2035
