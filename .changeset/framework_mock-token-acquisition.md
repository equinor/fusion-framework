---
"@equinor/fusion-framework": minor
---

Align the framework mock entry point with the MSAL mock's token-only identity API. Tests should use `configurator.msal.setAcquireToken` with `createMockToken`; the acquired token claims determine the active account.

Relates to equinor/fusion-core-tasks#2096
