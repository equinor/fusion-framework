# Backend-Issued Auth Code Flow

Enable automatic sign-in using a backend-issued authorization code without interactive login prompts.

## Overview

When your backend authenticates a user and generates a short-lived SPA auth code, the MSAL module can exchange it for tokens during initialization, eliminating double-login issues and providing seamless authentication.

## Usage

```typescript
import { enableMSAL } from '@equinor/fusion-framework-module-msal';

enableMSAL(configurator, (builder) => {
  builder.setClientConfig({
    auth: {
      clientId: 'your-client-id',
      tenantId: 'your-tenant-id'
    }
  });

  // Backend injects auth code as window.MSAL_AUTH_CODE during initial first page load
  // This is the most secure approach - only available on first render, cleared after use
  if (typeof window !== 'undefined' && window.MSAL_AUTH_CODE) {
    builder.setAuthCode(window.MSAL_AUTH_CODE);
    delete (window as any).MSAL_AUTH_CODE; // Clear after consuming
  }

  builder.setRequiresAuth(true);
});
```

## How It Works

1. Backend authenticates user and generates short-lived auth code
2. Frontend passes auth code to MSAL: `builder.setAuthCode(authCode)`
3. During `initialize()`: auth code exchanged for tokens (before `requiresAuth` check)
4. Tokens cached by MSAL → user automatically signed in
5. Falls back to standard MSAL flows on exchange failure

## API: `setAuthCode(authCode?: string)`

Sets backend-issued auth code for token exchange during initialization.

Pass `undefined` to clear/reset a previously configured auth code.

**Returns:** configurator instance (chainable)

**Behavior:**
- Exchange happens before `requiresAuth` check
- On success: user auto-authenticated, no login prompt
- On failure: falls back to standard MSAL login
- Auth code cleared after exchange (no reuse)
- `setAuthCode(undefined)` clears configured auth code
- `setAuthCode('')` is treated as absent auth code
- `setAuthCode('   ')` is trimmed and treated as absent auth code
- No auth-code exchange is attempted when auth code is absent/cleared

**Example:**

```typescript
// Best practice: Backend injects auth code on initial page load as window.MSAL_AUTH_CODE
if (typeof window !== 'undefined' && window.MSAL_AUTH_CODE) {
  builder.setAuthCode(window.MSAL_AUTH_CODE);
  delete (window as any).MSAL_AUTH_CODE; // Clear after consuming to prevent reuse
}

// Clear/reset auth code when input is missing
builder.setAuthCode(undefined);
```

## Security

- ✅ Auth codes: single-use, short-lived (5-10 min)
- ✅ MSAL validates tokens from Microsoft authority
- ✅ Tokens stored securely, refresh tokens auto-managed
- ⚠️ Pass codes securely: HTTPS, HTTP-only cookies, or encrypted channels

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Auth code not exchanged | Verify `setAuthCode()` called before init |
| Invalid auth code error | Confirm backend `WithSpaAuthCode` enabled, code is fresh |
| Still shows login prompt | Check auth code exchange completes before `requiresAuth` check |
| Exchange fails | Auth code may have expired; backend should generate fresh code per load |
