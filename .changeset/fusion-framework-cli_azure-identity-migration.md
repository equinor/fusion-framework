---
"@equinor/fusion-framework-cli": major
---

**BREAKING:** Replace CLI authentication backend from `@equinor/fusion-framework-module-msal-node` with `@equinor/fusion-framework-module-azure-identity`.

`ffc auth login` and `ffc auth token` now use `InteractiveBrowserCredential` with OS-level token persistence — tokens survive across process restarts without re-prompting. The previous MSAL-based token cache is no longer used; users must re-authenticate with `ffc auth login` after upgrading.

Ref: https://github.com/equinor/fusion-core-tasks/issues/1067
