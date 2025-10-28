# MSAL Authentication

This package includes React hooks for Microsoft authentication using MSAL v4.

> [!CAUTION]
> **Applications should NOT configure the MSAL module themselves.**
>
> The MSAL module **must be configured by the host/portal application**, not by individual apps. This is required for module hoisting, which allows sharing authentication state across all applications in a portal.
>
> - ✅ **Host/Portal:** Configure MSAL using `enableMSAL()` in the portal's configuration
> - ❌ **App:** Do NOT call `enableMSAL()` or configure the auth module
> - ✅ **App:** Just use the hooks to access the already-configured MSAL module

> [!IMPORTANT]
> `@equinor/fusion-framework-module-msal` must be installed to make MSAL hooks available

## Overview

The MSAL authentication hooks provide a simple way to integrate Microsoft authentication into your React applications. These hooks are built on top of `@equinor/fusion-framework-module-msal` and provide React-friendly access to authentication state and token acquisition.

Since the MSAL module is configured by your host application, you don't need to worry about configuration—just import and use the hooks!

The hooks use a simplified API that internally handles the MSAL v4 format, so you can use the simple `{ scopes: string[] }` format without worrying about the v4 nested request structure.

## Available Hooks

### useCurrentAccount

Returns the current authenticated user account information.

**Signature:**
```typescript
useCurrentAccount(): AccountInfo | undefined
```

**Example:**
```tsx
import { useCurrentAccount } from '@equinor/fusion-framework-react-app/msal';

const UserProfile = () => {
  const account = useCurrentAccount();
  
  if (!account) {
    return <span>Not authenticated</span>;
  }
  
  return (
    <div>
      <p>Username: {account.username}</p>
      <p>Name: {account.name}</p>
      <p>Tenant ID: {account.tenantId}</p>
    </div>
  );
};
```

**Returns:** `AccountInfo | undefined`

### useAccessToken

Returns just the access token string for making authenticated API calls.

**Signature:**
```typescript
useAccessToken(req: { scopes: string[] }): { token?: string; pending: boolean; error: unknown }
```

**Example:**
```tsx
import { useAccessToken } from '@equinor/fusion-framework-react-app/msal';
import { useMemo } from 'react';

const ProtectedComponent = () => {
  const { token, pending, error } = useAccessToken(
    useMemo(() => ({ scopes: ['User.Read'] }), [])
  );
  
  if (pending) return <span>Loading token...</span>;
  if (error) return <span>Error: {String(error)}</span>;
  
  return token ? <span>Token acquired</span> : <span>No token</span>;
};
```

**Parameters:**
- `req`: Object with `scopes` property - Array of OAuth scopes to request

**Returns:** 
- `token?: string` - The access token string if available
- `pending: boolean` - Whether the token request is in progress
- `error: unknown` - Any error that occurred during token acquisition

### useToken

Returns the full authentication result object with complete token information.

**Signature:**
```typescript
useToken(req: { scopes: string[] }): { token?: AuthenticationResult; pending: boolean; error: unknown }
```

**Example:**
```tsx
import { useToken } from '@equinor/fusion-framework-react-app/msal';
import { useMemo } from 'react';

const TokenInfo = () => {
  const { token, pending, error } = useToken(
    useMemo(() => ({ scopes: ['User.Read', 'api.read'] }), [])
  );
  
  if (pending) return <span>Loading...</span>;
  if (error) return <span>Error: {String(error)}</span>;
  if (!token) return <span>No token</span>;
  
  return (
    <div>
      <p>Access Token: {token.accessToken.substring(0, 20)}...</p>
      <p>Expires: {new Date(token.expiresOn).toLocaleString()}</p>
      <p>Token Type: {token.tokenType}</p>
      <p>Scope: {token.scopes.join(', ')}</p>
    </div>
  );
};
```

**Parameters:**
- `req`: Object with `scopes` property - Array of OAuth scopes to request

**Returns:**
- `token?: AuthenticationResult` - Full authentication result containing accessToken, account info, expiresOn, etc.
- `pending: boolean` - Whether the token request is in progress
- `error: unknown` - Any error that occurred during token acquisition

**Note:** The `AuthenticationResult` type includes:
- `accessToken: string`
- `account: AccountInfo`
- `expiresOn: Date`
- `tokenType: string`
- `scopes: string[]`
- And more...

## How It Works

Internally, these hooks call the MSAL provider's methods which support both legacy and modern formats:

```typescript
// The hook receives simple format:
useToken({ scopes: ['User.Read'] })

// Internally converts to MSAL v4 format:
msalProvider.acquireToken({ request: { scopes: ['User.Read'] } })
```

This means you can use the simpler API without dealing with the v4 nested structure, while still benefiting from MSAL v4 features under the hood.

## Complete Example

```tsx
import { useCurrentAccount, useAccessToken } from '@equinor/fusion-framework-react-app/msal';
import { useMemo, useState } from 'react';

const App = () => {
  const account = useCurrentAccount();
  
  // Get scopes from somewhere (e.g., service discovery)
  const [scopes] = useState(['User.Read', 'api.read']);
  
  const { token, pending, error } = useAccessToken(
    useMemo(() => ({ scopes }), [scopes])
  );

  return (
    <div>
      {!account && <p>Please log in</p>}
      
      {account && (
        <>
          <h1>Welcome, {account.name}!</h1>
          <p>Username: {account.username}</p>
          
          {pending && <p>Loading token...</p>}
          {error && <p>Error: {String(error)}</p>}
          {token && (
            <div>
              <p>Token acquired successfully</p>
              <pre>{token.substring(0, 50)}...</code>
            </div>
          )}
        </>
      )}
    </div>
  );
};
```

## Advanced Usage

### Dynamic Scopes

```tsx
const Component = () => {
  const [scopes, setScopes] = useState(['User.Read']);
  
  const { token, pending } = useAccessToken(
    useMemo(() => ({ scopes }), [scopes])
  );
  
  return (
    <div>
      <button onClick={() => setScopes(['User.Read', 'api.write'])}>
        Request More Permissions
      </button>
      {token && <p>Token ready</p>}
    </div>
  );
};
```

### Error Handling

```tsx
const Component = () => {
  const { token, error, pending } = useAccessToken(
    useMemo(() => ({ scopes: ['User.Read'] }), [])
  );
  
  useEffect(() => {
    if (error) {
      console.error('Token acquisition failed:', error);
      // Handle error appropriately
    }
  }, [error]);
  
  return pending ? <Loading /> : token ? <Content /> : <Error />;
};
```

## Performance Considerations

1. **Memoize request objects**: Always wrap the scopes object in `useMemo` to prevent unnecessary re-renders
   ```tsx
   // Bad - creates new object on every render
   const { token } = useAccessToken({ scopes: ['User.Read'] });
   
   // Good - stable reference
   const { token } = useAccessToken(
     useMemo(() => ({ scopes: ['User.Read'] }), [])
   );
   ```

2. **Dependent scopes**: Include scopes in the dependency array
   ```tsx
   const { token } = useAccessToken(
     useMemo(() => ({ scopes }), [scopes])
   );
   ```

## MSAL v4 Under the Hood

While the hooks use a simple API, they internally use MSAL v4:

- Hooks accept `{ scopes: string[] }` for simplicity
- Internally converts to `{ request: { scopes: string[] } }` format
- The provider supports both legacy and modern formats
- All benefits of MSAL v4 are available (better security, performance, etc.)

## Troubleshooting

### Hook Returns No Account

- Ensure user is logged in
- Check that MSAL module is properly configured
- Verify `useCurrentAccount()` hook is wrapped in a component within the framework provider

### Token Acquisition Fails

- Verify scopes are properly configured in Azure AD
- Check user has necessary permissions for requested scopes
- Review browser console for MSAL errors

### Performance Issues

- Ensure scopes object is memoized with `useMemo`
- Check for unnecessary re-renders of parent components

## Related Documentation

- [MSAL Module Documentation](https://equinor.github.io/fusion-framework/modules/auth/msal/) - Core MSAL provider
- [Microsoft MSAL Browser Docs](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser) - Official MSAL documentation
- [Azure AD App Registration Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app) - App registration guide
