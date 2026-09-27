---
"@equinor/fusion-framework": major
---

Align the framework mock entry point with the MSAL mock's token-only identity API.

**Breaking:** the framework `/mock` entry point no longer exports `MsalMockUser`, and its MSAL configurator no longer exposes direct account, token, or user mutation. Tests should use `configurator.msal.setAcquireToken` with `createMockToken`; the acquired token claims determine the active account.

Relates to equinor/fusion-core-tasks#2096
