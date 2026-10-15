---
"@equinor/fusion-framework-vite-plugin-api-service": patch
---

Fix proxy routes with `transformResponse` failing with `ERR_HTTP_HEADERS_SENT` (`Cannot set headers after they are sent to the client`) so the request hung and the response was never transformed. The route no longer flushes the response headers before the interceptor runs.

The response interceptor also skips writing the status code and headers when an earlier listener already sent them, and proxy routes only log responses with status 400 or above as errors.
