---
"@equinor/fusion-framework-module-http": major
---

Scoped MSAL requests now reject with `MissingAccessTokenException` before fetch when token
acquisition returns no token or no auth module is registered. Previously these requests could
be sent anonymously. Unscoped requests and token acquisition errors are unchanged.

Migration: handle the rejection rather than relying on the anonymous fallback. For intentionally
anonymous endpoints, configure a client without `defaultScopes` and omit per-request scopes.
The exception is exported from the package root and `/errors`.

Add `HttpException` as the shared base for all HTTP module errors and `.is(error)` guards
on the base and every concrete error. The guards recognize duplicate bundle copies by a
stable discriminator; response guards leave `response` and JSON `data` as `unknown`
rather than validating payload shapes. `HttpResponseError.is` includes JSON and SSE errors.

Migration: `ClientNotFoundException`, `MissingAccessTokenException`, and `HttpResponseError`
now extend `HttpException` rather than directly extending `Error`. JSON and SSE errors still
extend `HttpResponseError`; all remain `Error` instances. `ClientNotFoundException.name`
and `HttpResponseError.name` now use their concrete class names instead of `'Error'`.
Replace exact prototype or generic-name checks with the appropriate `.is(error)` guard.
Messages, constructor arguments, causes, responses, and JSON data are preserved.
Upgrade both host and application copies to use the new cross-bundle discriminator;
foreign custom subclasses with renamed errors are recognized only by `HttpException.is`.

Refs: https://github.com/equinor/fusion-core-tasks/issues/2035
