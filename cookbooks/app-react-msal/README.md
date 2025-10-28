# MSAL Authentication Cookbook

This cookbook demonstrates how to implement Microsoft authentication using the MSAL module in a React application with the Fusion Framework.

## Overview

This example showcases:
- **MSAL v4** authentication with Azure AD
- React hooks for authentication state management
- Token acquisition and management
- Integration with Fusion Framework's module system
- Displaying current user account information

## Features

- ✅ **User Authentication**: Login/logout functionality with Azure AD
- ✅ **Token Management**: Automatic token acquisition and refresh
- ✅ **Account Information**: Display current user account details
- ✅ **React Hooks**: Simple hooks for accessing authentication state
- ✅ **Service Discovery**: Integration with framework service discovery

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Azure AD app registration with proper redirect URIs
- Required environment variables configured

### Environment Variables

Configure the following environment variables:

```bash
# Azure AD Configuration
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_REDIRECT_URI=http://localhost:3000/callback

# Optional: Azure AD B2C support
AZURE_B2C_TENANT_ID=your-b2c-tenant-id
AZURE_B2C_CLIENT_ID=your-b2c-client-id
```

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Code Examples

### Using React Hooks

The cookbook uses React hooks from `@equinor/fusion-framework-react-app/msal`:

```typescript
import { useFramework } from '@equinor/fusion-framework-react-app/framework';
import {
  useAccessToken,
  useToken,
  useCurrentAccount,
} from '@equinor/fusion-framework-react-app/msal';
import { useMemo, useState } from 'react';

export const App = () => {
  // Get current user account
  const user = useCurrentAccount();
  
  // Get framework instance
  const framework = useFramework();
  
  // Manage scopes state
  const [scopes, setScopes] = useState<string[]>([]);

  // Get access token (string)
  const { token: accessToken } = useAccessToken(useMemo(() => ({ scopes }), [scopes]));
  
  // Get full token response
  const { token } = useToken(useMemo(() => ({ scopes }), [scopes]));

  return (
    <div>
      <h1>Current user:</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      
      <div>
        <h2>Access Token:</h2>
        <code>{accessToken}</code>
      </div>
    </div>
  );
};
```

### Using Framework Directly

You can also access the MSAL provider directly from the framework:

```typescript
const framework = useFramework();

// Get current account
const account = framework.modules.auth.account;

// Acquire access token (MSAL v4 format)
const token = await framework.modules.auth.acquireAccessToken({
  request: { scopes: ['User.Read'] }
});

// Login
await framework.modules.auth.login({
  request: { scopes: ['User.Read'] }
});

// Logout
const success = await framework.modules.auth.logout();
```

### MSAL v4 Format

The cookbook uses MSAL v4 compatible token acquisition:

```typescript
// Recommended: MSAL v4 format
const { token } = useAccessToken(
  useMemo(() => ({ 
    request: { scopes: ['User.Read', 'api.read'] } 
  }), [])
);

// Legacy format (still supported via proxy layer)
const { token: legacyToken } = useAccessToken(
  useMemo(() => ({ scopes: ['User.Read'] }), [])
);
```

## Available Hooks

### `useCurrentAccount()`

Returns the current authenticated account information.

```typescript
const account = useCurrentAccount();
// Returns: AccountInfo | null
```

### `useAccessToken(options)`

Returns just the access token string.

```typescript
const { token, error, loading } = useAccessToken({ 
  request: { scopes: ['User.Read'] } 
});
```

### `useToken(options)`

Returns the full authentication result object.

```typescript
const { token, error, loading } = useToken({ 
  request: { scopes: ['User.Read'] } 
});
// token: AuthenticationResult with full token response
```

## Configuration

The MSAL module is automatically configured via the app's module system. The configuration happens through environment variables and the framework's configuration system.

### Basic Configuration

```typescript
import { AppModuleInitiator } from '@equinor/fusion-framework-react-app';

export const configure: AppModuleInitiator = (configurator, env) => {
  console.log('Configuring application', env);
  
  // Callbacks for lifecycle events
  configurator.onConfigured((config) => {
    console.log('Application configured', config);
  });
  
  configurator.onInitialized((instance) => {
    console.log('Application initialized', instance);
  });
};
```

## MSAL v4 Migration Notes

This cookbook has been updated to use **MSAL Browser v4**. Key changes:

1. **Nested Request Objects**: All token operations now use nested `request` objects
2. **Return Value Changes**: `logout()` returns `boolean`, `handleRedirect()` returns `AuthenticationResult | null`
3. **New Properties**: Use `account` instead of `defaultAccount`
4. **Backward Compatible**: Legacy format still works via proxy layer

For detailed migration information, see the [MSAL Module README](../../packages/modules/msal/README.md).

## Troubleshooting

### Common Issues

**Authentication Loop**
- Check redirect URIs match your application's routing
- Verify redirect URI is registered in Azure AD

**Token Acquisition Fails**
- Verify scopes are properly configured
- Check user has necessary permissions

**Account Not Found**
- Ensure user is logged in
- Check `useCurrentAccount()` returns non-null value
- Verify MSAL initialization completed successfully

## Additional Resources

- [MSAL Module Documentation](../../packages/modules/msal/README.md)
- [Microsoft MSAL Browser Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser)
- [Azure AD App Registration Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

## Related Cookbooks

- [app-react](../app-react/README.md) - Basic React app setup
- [app-react-router](../app-react-router/README.md) - React Router integration
- [app-react-people](../app-react-people/README.md) - People service integration

