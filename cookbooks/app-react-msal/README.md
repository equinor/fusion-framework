# MSAL Authentication Cookbook

This cookbook demonstrates how to use Microsoft authentication (MSAL v4) in your Fusion Framework application.

## What This Shows

This cookbook illustrates how to:
- Get the current authenticated user account
- Acquire access tokens for API calls
- Use service discovery to get default scopes
- Display authentication state in your UI

## Key Concepts

The MSAL module provides React hooks that make authentication simple:
- `useCurrentAccount()` - Get the logged-in user's information
- `useAccessToken()` - Get just the token string
- `useToken()` - Get the full authentication result

## Code Example

### Getting User Account

```typescript
import { useCurrentAccount } from '@equinor/fusion-framework-react-app/msal';

export const App = () => {
  // Get the current user account
  const user = useCurrentAccount();
  
  return (
    <div>
      <h1>😎 Current user:</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
};
```

### Acquiring Access Tokens

The cookbook shows how to use service discovery to get default scopes:

```typescript
import { useFramework } from '@equinor/fusion-framework-react-app/framework';
import {
  useAccessToken,
  useToken,
  useCurrentAccount,
} from '@equinor/fusion-framework-react-app/msal';
import { useEffect, useMemo, useState } from 'react';

export const App = () => {
  const user = useCurrentAccount();
  const framework = useFramework();
  const [scopes, setScopes] = useState<string[]>([]);
  
  // Get default scopes from the framework's service discovery module
  useEffect(() => {
    framework.modules.serviceDiscovery
      .resolveService('portal') // Resolve the portal service
      .then((x) => x.defaultScopes) // Get its default scopes
      .then(setScopes);
  }, [framework]);

  return (
    <div>
      <h1>😎 Current user:</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      
      {/* Show tokens if we have scopes */}
      {scopes.length && <AccessToken scopes={scopes} />}
    </div>
  );
};
```

### The AccessToken Component

```typescript
import {
  useAccessToken,
  useToken,
} from '@equinor/fusion-framework-react-app/msal';
import { useMemo } from 'react';

/**
 * Component for displaying access tokens
 */
const AccessToken = ({ scopes }: { scopes: string[] }) => {
  // Get just the token string
  const { token: accessToken } = useAccessToken(useMemo(() => ({ scopes }), [scopes]));
  
  // Get the full authentication result (includes expiry, scopes, etc.)
  const { token } = useToken(useMemo(() => ({ scopes }), [scopes]));
  
  return (
    <div>
      <h2>🧩 Token:</h2>
      <b>Access token (string):</b>
      <code>{accessToken}</code>
      
      <b>Full token response:</b>
      <pre>{JSON.stringify(token, null, 4)}</pre>
    </div>
  );
};
```

## Understanding the Pattern

### Service Discovery for Scopes

The framework's service discovery module helps you get the right scopes for different services:

```typescript
framework.modules.serviceDiscovery
  .resolveService('portal')
  .then((service) => service.defaultScopes)
```

This ensures you're requesting the correct permissions for the service you want to access.

### Memoizing Scope Objects

When passing options to hooks, wrap them in `useMemo` to avoid unnecessary re-renders:

```typescript
const { token } = useAccessToken(useMemo(() => ({ scopes }), [scopes]));
```

### AccessToken vs Token

- `useAccessToken()` returns just the token string - useful for API calls
- `useToken()` returns the full response - includes expiry, scopes, account info, etc.

## Authentication Flow

1. User logs in through Azure AD
2. MSAL module stores the authentication state
3. Hooks provide access to account and tokens
4. Tokens are automatically refreshed when needed

## When to Use This

Use MSAL authentication when:
- You need to verify the user's identity
- You need to make authenticated API calls
- You want to display user information
- You're building an enterprise application with Azure AD

The MSAL module handles all the complexity of token acquisition, refresh, and storage automatically.