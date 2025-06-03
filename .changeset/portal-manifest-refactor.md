---
"@equinor/fusion-framework-cli": minor

refactor(portal-manifest): standardize manifest structure and dev server config

- Portal manifest now uses `name` (unscoped) and `templateEntry` instead of `id` and `entrypoint` for consistency
- Dev server config and routing updated to expect new manifest structure
- Asset paths for dev/preview builds now use `/@fs` for local development
- Improved type safety and schema validation for portal manifests
- Fixed minor typos and improved comments for clarity

This refactor improves consistency between app and portal manifest handling, simplifies local development, and ensures better type safety and validation.
