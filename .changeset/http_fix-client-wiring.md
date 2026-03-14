---
"@equinor/fusion-framework-module-http": patch
---

Fix HTTP client configuration so `responseHandler` options are applied when creating clients, preserve request `path` values in the request pipeline, only treat absolute `http:` and `https:` strings as ad-hoc client URLs, avoid mutating caller-provided MSAL request init objects, and re-export the SSE helpers from the operators and selectors entry points.