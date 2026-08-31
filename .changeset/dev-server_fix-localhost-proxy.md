---
"@equinor/fusion-framework-dev-server": patch
---

Proxy mock services advertised through `<service>.localhost` via plain `localhost` while preserving
the service-key path. This avoids `ENOTFOUND` failures on Linux runners without changing normal
upstream service proxying.
