---
"@equinor/fusion-framework-module-telemetry": patch
---

Internal: move framework dependencies to peerDependencies to prevent duplicate installations and version conflicts.

Framework module dependencies (`@equinor/fusion-framework-module` and `@equinor/fusion-framework-module-event`) are now properly declared as peer dependencies instead of direct dependencies. This ensures consumers provide compatible framework versions and prevents duplicate package installations in node_modules.
