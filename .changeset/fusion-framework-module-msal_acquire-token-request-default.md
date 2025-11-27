---
"@equinor/fusion-framework-module-msal": patch
---

Ensure `acquireToken` normalizes legacy options when `request` is omitted by creating a default request object and applying active account fallback.

Previously `{ scopes: ["User.Read"] }` could yield a request without `account`, relying on downstream resolution. The provider now explicitly supplies an empty request object, resolves `account` from the active session, and merges legacy `scopes` for clearer telemetry and safer behavior.

Before:
```typescript
await provider.acquireToken({ scopes: ["User.Read"] }); // request undefined, account implicit
```
After (both forms valid, account resolved automatically):
```typescript
await provider.acquireToken({ scopes: ["User.Read"] });
await provider.acquireToken({ request: { scopes: ["User.Read"] } });
```

Internal: improves stability of legacy usage without breaking API.