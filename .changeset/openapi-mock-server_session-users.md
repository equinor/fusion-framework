---
"@equinor/fusion-openapi-mock-server": minor
---

Add a test-runner-agnostic mock-auth helper and session-isolated user API that issues unsigned OBO-style tokens for Fusion MSAL scope requests without restarting test servers. Credentialed browser access allows canonical loopback origins on every port; other origins require an explicit exact-origin allowlist.

Relates to equinor/fusion-core-tasks#2096
