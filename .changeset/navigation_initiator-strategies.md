---
"@equinor/fusion-framework-module-navigation": minor
---

Add typed initiator navigation strategies.

`enableNavigation` accepts `{ initiator }` and `NavigationConfigurator.setInitiator()` accepts `{ kind: 'host', history, basename }` or `{ kind: 'memory', initialLocation?, basename? }`. Explicit app configuration takes precedence over the initiator, which takes precedence over standalone browser defaults. A host history is wrapped and never disposed; a memory history is created per module instance, owned by the module and never reads or modifies `window.location`. An explicit basename or history that conflicts with the host strategy fails startup with a `NavigationInitiatorConflictError` identifying both settings.

`resolvePath` no longer consults `window.location` when parsing relative paths.

Tracking: equinor/fusion-core-tasks#2354.
