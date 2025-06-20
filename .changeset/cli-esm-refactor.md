---
"@equinor/fusion-framework-cli": minor
---

Refactor CLI package to use deepmerge instead of lodash.mergewith, update all imports to use explicit .js extensions, and re-export all bin entrypoints for ESM compatibility.

- All internal and public imports now use ESM .js extensions and package entrypoints are re-exported from bin/index.ts for ESM consumers.
- Replaced all uses of lodash.mergewith with deepmerge for config and manifest merging utilities.
- All CLI commands and helpers now import from '@equinor/fusion-framework-cli/bin' or '@equinor/fusion-framework-cli/lib' for consistency and ESM support.
- All internal helpers, types, and utilities now use explicit .js extensions in imports.
- All CLI commands and helpers now use named exports from bin/index.ts and lib/index.ts.
- Removed legacy CJS/Node.js import paths and updated all references to ESM-compatible imports.
- Updated package.json exports, typesVersions, and files to match new ESM structure and ensure correct publishing.
- Added rollup-plugin-replace to inject Node.js version environment variables at build time.
- Updated tsconfig.json to use NodeNext module resolution and output ESM.
- Removed .npmignore in favor of explicit files array in package.json.


This release modernizes the CLI package for ESM compatibility, improves config merging reliability, and standardizes all imports/exports for maintainability and future-proofing. See the README for more migration details.
