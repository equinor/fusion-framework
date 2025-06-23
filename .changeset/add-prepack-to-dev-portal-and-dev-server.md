---
"@equinor/fusion-framework-dev-portal": patch
"@equinor/fusion-framework-dev-server": patch
---

Add `prepack` script to `dev-portal` and `dev-server` packages

- Added a `prepack` script to `@equinor/fusion-framework-dev-portal` and `@equinor/fusion-framework-dev-server` to ensure the build runs before packaging.
- This helps guarantee that the latest build artifacts are included when publishing these packages.
