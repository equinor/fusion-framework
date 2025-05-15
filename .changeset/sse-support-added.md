---
"@equinor/fusion-framework-module-http": minor
---

### Added

- Introduced support for Server-Sent Events (SSE) in the HTTP module.
  - Added `sse$` method to `HttpClient` for subscribing to SSE streams.
  - Added `sseMap` operator for handling SSE in RxJS pipelines.
  - Added `createSseSelector` for transforming SSE responses into observables.
  - Enhanced error handling with `ServerSentEventResponseError`.

### Documentation

- Updated README with examples and usage details for SSE support.
