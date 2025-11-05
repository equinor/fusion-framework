---
"@equinor/fusion-framework-module-msal-node": major
---

Update AuthProvider interfaces to match MSAL v4 API format.

This is a breaking change that updates the method signatures:
- `login(options: { scopes: string[] })` → `login(options: { request: { scopes: string[] } })`
- `acquireAccessToken(options: { scopes: string[]; interactive?: boolean })` → `acquireAccessToken(options: { request: { scopes: string[] }; interactive?: boolean })`

**Migration:** Update all calls to use the new `{ request: { scopes } }` format.

```typescript
// Before
await authProvider.login({ scopes: ['user.read'] });
await authProvider.acquireAccessToken({ scopes: ['api.read'] });

// After  
await authProvider.login({ request: { scopes: ['user.read'] } });
await authProvider.acquireAccessToken({ request: { scopes: ['api.read'] } });
```

Fixes TypeScript compilation errors and ensures API consistency with MSAL v4.
