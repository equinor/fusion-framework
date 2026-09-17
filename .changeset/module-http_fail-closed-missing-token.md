---
"@equinor/fusion-framework-module-http": major
---

The MSAL request handler now fails closed instead of silently sending an anonymous request when a scoped request cannot get an access token. Previously, if `acquireAccessToken` resolved to `undefined` for any reason (expired session, consent required, running inside MSAL's hidden iframe, etc.), the request was still sent without an `Authorization` header, which could produce avoidable `401` responses from the target service. The handler now throws `MissingAccessTokenException` in that case, so a scoped request never leaves the client anonymously.

```typescript
// Before: a request with scopes silently went out anonymously when no token was available
await client.fetch$('/api/data', { scopes: ['api.read'] }); // resolved, response could be a 401

// After: the same call fails fast, in-process, instead of hitting the network
await client.fetch$('/api/data', { scopes: ['api.read'] }); // rejects with MissingAccessTokenException
```

Migration: catch `MissingAccessTokenException` (exported from `@equinor/fusion-framework-module-http`) around scoped requests that must tolerate an unauthenticated fallback, or ensure `acquireAccessToken` resolves before issuing the request.

Fixes: https://github.com/equinor/fusion-core-tasks/issues/2035
