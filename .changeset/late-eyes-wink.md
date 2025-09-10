---
"@equinor/fusion-framework-module-app": patch
---

Improve error handling in AppClient

- Add support for HTTP 410 (Gone) status code handling across all error types
- Import and use `HttpJsonResponseError` for more specific error handling in `getAppManifest`
- Add 'deleted' error type to handle when application resources have been deleted
- Update error handling logic to properly handle different error types in the catch blocks
- Ensure proper error propagation and type checking for manifest, config, and settings errors