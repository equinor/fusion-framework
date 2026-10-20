---
"@equinor/fusion-framework-cookbook-app-react-roles": patch
"@equinor/fusion-framework-cookbook-app-react-context": patch
"@equinor/fusion-framework-cookbook-app-react-mock-playwright": patch
---

Internal: use explicit IPv4 loopback addresses for Playwright application listeners, readiness checks, API proxies, and mock clients so Windows tests do not depend on ambiguous `localhost` address-family resolution.
