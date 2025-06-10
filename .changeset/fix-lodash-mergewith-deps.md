---
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Fix dependency and devDependency declarations for lodash.mergewith:

- Move "lodash.mergewith" to dependencies and ensure correct version for @types/lodash.mergewith in devDependencies.
- Remove duplicate and misplaced entries for lodash.mergewith and its types.
- Remove unused @equinor/fusion-framework-vite-plugin-api-service from devDependencies.
- Update lockfile to match package.json changes.

This ensures correct dependency management and resolves potential issues with type resolution and package installation.
