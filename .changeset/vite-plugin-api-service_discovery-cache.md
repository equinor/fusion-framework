---
"@equinor/fusion-framework-vite-plugin-api-service": minor
---

Cache service discovery responses in `createProxyHandler` so browser reload loops cannot flood the upstream discovery API from the dev server.

- Successful responses are reused for 60 seconds; the raw payload is re-processed per request, so `referer`-based service URIs stay correct.
- Failed responses (status `>= 400`) are answered with the same status code for 10 seconds without calling upstream.
- Entries are keyed by URL and a hash of the `Authorization` header, and only `GET` requests are cached. Cached responses carry `x-fusion-discovery-cache: hit`.

`ApiProxyHandler` gains an optional `middleware` member that the plugin mounts ahead of the Vite proxy.

Also fixes `createResponseInterceptor` forwarding error (status `>= 400`) and non-JSON responses without their upstream status code and headers — a `401` from service discovery previously reached the browser as `200`.
