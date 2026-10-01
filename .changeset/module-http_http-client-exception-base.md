---
"@equinor/fusion-framework-module-http": major
---

Added `HttpClientException`, a shared base class for every error thrown by the HTTP client (`ClientNotFoundException`, `HttpResponseError`, `HttpJsonResponseError`, `ServerSentEventResponseError`, `MissingAccessTokenException`). Each class now exposes a static `.is(error)` type guard that recognizes the error structurally instead of via `instanceof`, so a portal (or any host) can reliably recognize an error thrown by a hosted app even when the app bundles its own separate copy of `@equinor/fusion-framework-module-http`.

```typescript
function onUnhandledAppError(error: unknown) {
  // cross-bundle: the app's exception isn't the same class reference as the portal's
  if (HttpClientException.is(error)) {
    reportHttpClientFailure(error.message);
  }
}
```

`instanceof` still works for a caller catching its own `client.fetch(...)` call directly in the same bundle; `.is()` is for the cross-bundle case.

This is a breaking change: `ClientNotFoundException` previously extended `Error` directly and never set `.name` (it read as `"Error"`); it now extends `HttpClientException` and `.name` reads as `"ClientNotFoundException"`. `HttpResponseError` previously never set `.name` either and now reads as `"HttpResponseError"`. Code that inspected `.name` or the exact prototype chain of these errors should switch to the new `.is()` guards.
