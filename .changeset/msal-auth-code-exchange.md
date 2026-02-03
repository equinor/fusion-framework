---
"@equinor/fusion-framework-module-msal": minor
---

Add support for backend-issued auth code exchange in MSAL module

Enable automatic sign-in using a backend-issued SPA authorization code without requiring interactive MSAL login flows. This eliminates double-login issues and provides seamless user experience when backend pre-authenticates users.

**New API:**

- `MsalConfigurator.setAuthCode(authCode: string)` - Configure backend auth code for token exchange
- `IMsalClient.acquireTokenByCode(request)` - Exchange auth code for tokens (inherited from PublicClientApplication)

**How it works:**

1. Backend authenticates user and generates short-lived SPA auth code
2. Frontend calls `builder.setAuthCode(authCode)` during MSAL configuration
3. During `initialize()`, auth code is exchanged for tokens before `requiresAuth` check
4. Tokens are cached by MSAL - user is automatically signed in
5. Falls back to standard MSAL flows if exchange fails

**Example:**

```typescript
enableMSAL(configurator, (builder) => {
  builder.setClientConfig({
    auth: { clientId: 'app-id', tenantId: 'tenant-id' }
  });

  // Backend injects auth code as window.MSAL_AUTH_CODE during initial first page load
  if (typeof window !== 'undefined' && window.MSAL_AUTH_CODE) {
    builder.setAuthCode(window.MSAL_AUTH_CODE);
    delete (window as any).MSAL_AUTH_CODE; // Clear after consuming
  }

  builder.setRequiresAuth(true);
});
```

Fixes: https://github.com/equinor/fusion-core-tasks/issues/271
