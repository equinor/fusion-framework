---
"@equinor/fusion-framework-cli": minor
---

Migrate CLI authentication from `@equinor/fusion-framework-module-msal-node` to `@equinor/fusion-framework-module-azure-identity`.

`ffc auth login` and `ffc auth token` now use `InteractiveBrowserCredential` with OS-level token persistence — tokens survive across process restarts without re-prompting.

Ref: https://github.com/equinor/fusion-core-tasks/issues/1067
