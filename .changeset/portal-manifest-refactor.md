---
"@equinor/fusion-framework-cli": minor
---

- Portal manifest now uses `name` (unscoped) and `templateEntry` instead of `id` and `entrypoint` for improved consistency with app manifests.
- Dev server configuration and routing updated to expect and utilize the new manifest structure.
- Asset paths for development and preview builds now use `/@fs` for more reliable local development.
- Type safety and schema validation for portal manifests have been improved.
- Minor typos fixed and comments clarified throughout related files.

This refactor unifies manifest handling between apps and portals, simplifies local development, and ensures better type safety and validation. It also improves maintainability and developer experience by making configuration more predictable and robust.
