---
'@equinor/fusion-framework-module-http': patch
---

Append `Accecpt: application/json` to request headers

when using the `json$` or `json` function on the `HttpClient` add `Accecpt: application/json` to the request header
