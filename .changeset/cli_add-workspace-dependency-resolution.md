---
"@equinor/fusion-framework-cli": minor
---

Add workspace dependency resolution to create app command

- Added `updatePackageJson` helper for updating package.json with app name and resolving workspace dependencies
- Added `resolve-workspace-dependencies` helper to convert workspace:^ dependencies to npm versions
- Added `package-info` utility for fetching package metadata from npm registry
- Integrated workspace dependency resolution into create app workflow
- Improved error handling and logging throughout the create app process
- Added comprehensive TSDoc documentation for all new functions

This ensures that apps created from templates have proper npm versions instead of workspace references, making them deployable outside the monorepo.
