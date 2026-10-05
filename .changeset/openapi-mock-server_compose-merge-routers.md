---
"@equinor/fusion-openapi-mock-server": patch
---

Fix `serviceDiscovery: 'merge'` layers dropping the earlier layer's middleware. A merge layer's `middleware` routes are now checked first, and the earlier service's routes still handle every request the merge layer does not register, as documented. Previously, any merge layer with middleware replaced the whole earlier router, so adding one custom route removed all inherited routes (for example the Roles V2 or local help docs handlers). When both layers define a `reset` hook, a server reset now runs both (earliest layer first), so state used by inherited routes no longer leaks between tests. The new `composeRouters` helper in `@equinor/fusion-openapi-mock-server/discovery` implements this layering.
