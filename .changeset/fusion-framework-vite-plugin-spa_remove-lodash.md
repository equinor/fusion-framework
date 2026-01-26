---
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Remove `lodash.mergewith` from the SPA Vite plugin by switching environment merging to a simple object merge where loaded environment values override plugin defaults.

Resolves: https://github.com/equinor/fusion-framework/security/dependabot/188
Resolves: https://github.com/equinor/fusion-framework/security/dependabot/189