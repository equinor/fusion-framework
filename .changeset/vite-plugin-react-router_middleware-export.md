---
"@equinor/fusion-framework-vite-plugin-react-router": minor
---

Wire route-module `middleware` exports into generated routes.

A route module used with the routing DSL can now `export const middleware = [...]`, directly or as a re-export. The plugin imports it next to `clientLoader`, `action`, `handle`, `ErrorElement` and the other route exports, and passes it as the route's `middleware` property. Modules without a `middleware` export generate the same output as before. Ref equinor/fusion-core-tasks#2352.
