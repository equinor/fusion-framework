---
"@equinor/fusion-framework-vite-plugin-api-service": patch
---

Include the HTTP request method in proxy request/response log messages, so multiple requests to the same URL (e.g. `GET` vs `POST`) can be distinguished in dev-server logs.
