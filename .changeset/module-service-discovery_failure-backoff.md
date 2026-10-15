---
"@equinor/fusion-framework-module-service-discovery": minor
---

Harden `ServiceDiscoveryClient` against flooding the service discovery API when requests fail.

Previously a failed request was not cached, so every retry, page reload, or re-render called the API again immediately — a single broken app could produce thousands of failed requests per minute.

- **Failure backoff:** after a failure the client pauses outgoing requests for 1s, 2s, 4s … up to 30s (with jitter), and resets on the next success. Concurrent callers sharing one failed request count as one failure.
- **Stale fallback:** when a refresh fails, or a call arrives during the pause, the last successful service list (younger than 24h) is returned instead of an error.
- **Fail fast:** without a fallback, the failing request still rethrows its original error; calls during the pause throw the new `ServiceDiscoveryUnavailableError` (with `cause` and `retryAt`) without a network request.
