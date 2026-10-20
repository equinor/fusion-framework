---
"@equinor/fusion-framework-react-router": minor
---

Add the Node-only `resolveSitemap` API at `@equinor/fusion-framework-react-router/build`.
It reads an explicit `src/routes.ts` DSL registry and page `handle.route` metadata
without executing registry or page code, returning the existing flat manifest
route-schema format. Missing files and non-static definitions fail explicitly.
Filesystem route discovery is intentionally deferred.

Ref: equinor/fusion-core-tasks#2350
