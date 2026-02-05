---
"@equinor/fusion-framework-dev-portal": patch
---

Add workspace dependencies as optional peerDependencies.

This change ensures that dev-portal will automatically bump whenever any of its workspace dependencies are updated, without requiring consumers to install them. The dependencies are marked as optional in `peerDependenciesMeta` to allow flexibility for different deployment scenarios.
