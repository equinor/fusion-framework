---
"@equinor/fusion-framework-module-event": patch
---

Remove `lodash.clonedeep` from the event module by using `structuredClone` for capturing `FrameworkEvent.originalDetail`.

Resolves: https://github.com/equinor/fusion-framework/security/dependabot/188
Resolves: https://github.com/equinor/fusion-framework/security/dependabot/189