
`@equinor/fusion-framework-module-msal` provides secure Azure AD authentication for browser applications using Microsoft's MSAL (Microsoft Authentication Library). Perfect for web applications, SPAs, and React apps that need to authenticate with Microsoft services.

## Features

- **Single Sign-On (SSO)** support for Microsoft Azure AD and Azure AD B2C
- **Token Management** with automatic refresh and secure caching
- **Module Hoisting** for shared authentication state across application scopes
- **Silent Authentication** for seamless user experience
- **Popup & Redirect Flows** for different authentication scenarios
- **Zero Configuration** with sensible defaults and optional customization

## Quick Start

```bash
pnpm add @equinor/fusion-framework-module-msal
```

```typescript
import { enableMSAL } from '@equinor/fusion-framework-module-msal';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';

const configurator = new ModulesConfigurator();

enableMSAL(configurator, (builder) => {
  builder.setClientConfig({
    tenantId: 'your-tenant-id',
    clientId: 'your-client-id',
    redirectUri: 'https://your-app.com/callback'
  });
  builder.setRequiresAuth(true);
});

const framework = await initialize();
const token = await framework.auth.acquireAccessToken({ 
  scopes: ['https://graph.microsoft.com/.default'] 
});
```

> [!IMPORTANT]
> The `@equinor/fusion-framework-app` enables this package by default, so applications using the app package do not need to enable this module manually.


## Configuration

### Required Settings

| Setting | Description | Required |
|---------|-------------|----------|
| `clientId` | Azure AD application client ID | ✅ |
| `tenantId` | Azure AD tenant ID | ✅ |
| `redirectUri` | Authentication callback URL | Optional |

### Optional Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `requiresAuth` | Auto-authenticate on initialization | `false` |
| `version` | Force specific MSAL version | `Latest` |

### Environment Variables

```bash
# Required
AZURE_CLIENT_ID=your-client-id
AZURE_TENANT_ID=your-tenant-id

# Optional
AZURE_REDIRECT_URI=https://your-app.com/callback
```

## API Reference

### `enableMSAL(configurator, configure)`

Enables the MSAL module in your Fusion Framework application.

**Parameters:**
- `configurator`: `ModulesConfigurator` - The modules configurator instance
- `configure`: `(builder: IAuthConfigurator) => void` - Configuration function

### `IAuthProvider`

The authentication provider interface available at `framework.auth`:

```typescript
interface IAuthProvider {
  // Current user account information
  readonly defaultAccount: AccountInfo | undefined;
  
  // Acquire an access token for the specified scopes
  acquireAccessToken(options: { scopes: string[] }): Promise<string | undefined>;
  
  // Acquire full authentication result
  acquireToken(options: { scopes: string[] }): Promise<AuthenticationResult | void>;
  
  // Login user
  login(): Promise<void>;
  
  // Logout user
  logout(options?: { redirectUri?: string }): Promise<void>;
  
  // Handle authentication redirect
  handleRedirect(): Promise<void | null>;
}
```


## Module Hoisting

The module implements a hoisting pattern where the authentication provider is created once at the root level and shared across all sub-modules. This ensures consistent authentication state throughout your application while maintaining security and performance.

> [!IMPORTANT]
> **Configure the auth module only in the root Fusion Framework instance** - Sub-instances will automatically inherit the authentication configuration from the parent.

## Migration Guide

### Version 4 Breaking Changes

**Module Hoisting**: The module now uses module hoisting, meaning sub-module instances proxy the parent module instance. This creates a shared authentication state across all module instances.

**Removed Multi-Client Support**: This version no longer supports multiple MSAL clients (multi-tenant, multi-authority) in the same scoped instance due to how `@azure/msal-browser` uses a shared cache.

**Benefits of V4**:
- Shared authentication state across application scopes
- Improved performance and memory usage
- Simplified configuration management
- Better integration with Fusion Framework architecture

#### Migration Steps

1. **Update Configuration**: Ensure only the root module configures MSAL
2. **Remove Duplicate Configurations**: Remove MSAL configuration from child modules
3. **Update Authentication Logic**: Rely on shared authentication state
4. **Test Multi-Scope Applications**: Verify authentication works across different application scopes

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Authentication Loop** | Ensure redirect URIs match your application's routing |
| **Token Acquisition Fails** | Check that required scopes are properly configured |
| **Module Not Found** | Ensure the module is properly configured and framework is initialized |
| **Multiple MSAL Instances** | Remove duplicate configurations from child modules |

### Getting Help

- 📖 [MSAL Cookbook](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-msal) - Complete working examples
- 🐛 [Report Issues](https://github.com/equinor/fusion/issues) - Bug reports and feature requests

## Additional Resources

- [Microsoft Graph API Documentation](https://docs.microsoft.com/en-us/graph/)
- [Azure AD App Registration Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [MSAL Browser Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser)
- [Fusion Framework Documentation](https://github.com/equinor/fusion-framework)



