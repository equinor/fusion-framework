---
"@equinor/fusion-framework-cli": patch
---

Refactor dev server config loading and merging:

- Add `RecursivePartial` type for improved type safety and flexibility in dev server config overrides.
- Update `mergeDevServerConfig` to use a custom array merge strategy (source arrays replace and prepend base arrays).
- Refactor `loadDevServerConfig` to support async config functions and deep merging with the new strategy.
- Improve inline documentation and maintainability for config utilities.

This change improves the developer experience and reliability of dev server configuration in the CLI package.
