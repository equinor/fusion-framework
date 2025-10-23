---
"@equinor/fusion-framework-module-msal": major
---

Add optional provider-level telemetry for MSAL flows and update interface methods.

**BREAKING CHANGES:**
- `acquireAccessToken(options: AcquireTokenOptions)` → `acquireAccessToken(options: AcquireTokenOptionsLegacy)`
- `acquireToken(options: AcquireTokenOptions)` → `acquireToken(options: AcquireTokenOptionsLegacy)`
- `logout(options?: LogoutOptions): Promise<void>` → `logout(options?: LogoutOptions): Promise<boolean>`
- `handleRedirect(): Promise<void>` → `handleRedirect(): Promise<AuthenticationResult | null>`
- Added `initialize(): Promise<void>` method

**New Features:**
- Optional provider-level telemetry for MSAL flows (login, token acquisition, redirect handling)
- Emits telemetry events and measurements via injected telemetry provider when available
- Includes basic metadata (framework module version, clientId, tenantId) and authentication context
- Integrates MSAL client logging with framework telemetry system

**Migration:**
```typescript
// Before
await msalProvider.acquireAccessToken({ scopes: ['user.read'] });
await msalProvider.logout();
const result = await msalProvider.handleRedirect();

// After
await msalProvider.acquireAccessToken({ request: { scopes: ['user.read'] } });
const logoutResult = await msalProvider.logout(); // Now returns boolean
const result = await msalProvider.handleRedirect(); // Now returns AuthenticationResult | null
await msalProvider.initialize(); // New required method
```

Related to `Add Telemetry Integration to MSAL Module` [#3634](https://github.com/equinor/fusion-framework/issues/3634).

