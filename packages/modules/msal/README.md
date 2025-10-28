
`@equinor/fusion-framework-module-msal` provides secure Azure AD authentication for browser applications using Microsoft's MSAL (Microsoft Authentication Library). Perfect for web applications, SPAs, and React apps that need to authenticate with Microsoft services.

> **Version**: This package now uses **MSAL Browser v4**, providing the latest security improvements and features from Microsoft.

## Features

- **Single Sign-On (SSO)** support for Microsoft Azure AD and Azure AD B2C
- **Token Management** with automatic refresh and secure caching
- **Module Hoisting** for shared authentication state across application scopes
- **Silent Authentication** for seamless user experience
- **Popup & Redirect Flows** for different authentication scenarios
- **Zero Configuration** with sensible defaults and optional customization
- **MSAL v4 Compatibility** with v2 proxy layer for backward compatibility

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

// MSAL v4 preferred token acquisition (recommended)
const token = await framework.auth.acquireAccessToken({ 
  request: { scopes: ['https://graph.microsoft.com/.default'] } 
});

// Legacy format still supported (via v2 proxy layer)
const legacyToken = await framework.auth.acquireAccessToken({ 
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
interface IMsalProvider {
  // The MSAL PublicClientApplication instance
  readonly client: IMsalClient;
  
  // Current user account information (v4)
  readonly account: AccountInfo | null;
  
  // Deprecated: Current user account (v2 compatible via proxy)
  readonly defaultAccount?: AccountInfo | undefined;
  
  // Initialize the MSAL provider (v4)
  initialize(): Promise<void>;
  
  // Acquire an access token for the specified scopes
  acquireAccessToken(options: AcquireTokenOptionsLegacy): Promise<string | undefined>;
  
  // Acquire full authentication result
  acquireToken(options: AcquireTokenOptionsLegacy): Promise<AcquireTokenResult>;
  
  // Login user interactively
  login(options: LoginOptions): Promise<LoginResult>;
  
  // Logout user (now returns boolean)
  logout(options?: LogoutOptions): Promise<boolean>;
  
  // Handle authentication redirect (now returns AuthenticationResult | null)
  handleRedirect(): Promise<AuthenticationResult | null>;
}
```


## Module Hoisting

The module implements a hoisting pattern where the authentication provider is created once at the root level and shared across all sub-modules. This ensures consistent authentication state throughout your application while maintaining security and performance.

> [!IMPORTANT]
> **Configure the auth module only in the root Fusion Framework instance** - Sub-instances will automatically inherit the authentication configuration from the parent.

## Migration Guide

### MSAL v2 to v4 Migration

This package has been upgraded from MSAL Browser v2 to v4, providing the latest security improvements and features from Microsoft.

#### What Changed in v4

**New MSAL Browser v4 Features:**
- Enhanced security with improved token management
- Better performance and memory usage
- New authentication API structure with nested request objects
- Improved error handling and retry mechanisms

**Architecture Changes:**
- **Module Hoisting**: The module uses module hoisting, meaning sub-module instances proxy the parent module instance
- **Shared Authentication State**: Authentication state is shared across all module instances
- **Async Initialization**: New `initialize()` method must be called before using the provider

#### Breaking Changes

1. **New `initialize()` Method Required**
   ```typescript
   // The provider now has an initialize method that must be called
   const provider = new MsalProvider(config);
   await provider.initialize(); // New requirement
   ```

2. **API Method Signature Updates**
   - `logout()` now returns `Promise<boolean>` instead of `Promise<void>`
   - `handleRedirect()` now returns `Promise<AuthenticationResult | null>` instead of `Promise<void>`
   - Methods now expect nested request objects (v4 format)

3. **Account Property Changes**
   - Use `account` property instead of `defaultAccount` (v4 native)
   - `defaultAccount` is still available via v2 proxy layer for backward compatibility

#### Migration Steps

1. **Update Token Acquisition** (Recommended)
   ```typescript
   // Before (v2 format - still works via proxy)
   const token = await framework.auth.acquireAccessToken({ 
     scopes: ['api.read'] 
   });
   
   // After (v4 format - recommended)
   const token = await framework.auth.acquireAccessToken({ 
     request: { scopes: ['api.read'] } 
   });
   ```

2. **Update Logout Handling**
   ```typescript
   // Before
   await framework.auth.logout();
   
   // After (check return value)
   const success = await framework.auth.logout();
   if (success) {
     // Handle successful logout
   }
   ```

3. **Update Redirect Handling**
   ```typescript
   // Before
   await framework.auth.handleRedirect();
   
   // After (handle result)
   const result = await framework.auth.handleRedirect();
   if (result?.account) {
     // User authenticated successfully
     console.log('Logged in as:', result.account.username);
   }
   ```

4. **Update Configuration** (if needed)
   ```typescript
   // Ensure only the root module configures MSAL
   enableMSAL(configurator, (builder) => {
     builder.setClientConfig({
       tenantId: 'your-tenant-id',
       clientId: 'your-client-id',
       redirectUri: 'https://your-app.com/callback'
     });
     builder.setRequiresAuth(true);
   });
   ```

5. **Remove Duplicate Configurations**: Remove MSAL configuration from child modules

#### Backward Compatibility

The module includes a **v2 proxy layer** that automatically converts v2 API calls to v4 format. This means:
- ✅ Existing code continues to work without changes
- ✅ Legacy format `{ scopes: [] }` is still supported
- ✅ Deprecated properties like `defaultAccount` still work (with deprecation warnings)
- ⚠️ New v4 features require using v4 format

#### Benefits of Migration

- **Better Security**: Latest MSAL v4 security improvements
- **Improved Performance**: Faster token acquisition and caching
- **Enhanced Error Handling**: More robust error recovery
- **Future-Proof**: Access to latest Microsoft authentication features
- **Shared State**: Improved authentication state management across app scopes

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

## Version Management

The MSAL module includes built-in version checking to ensure compatibility between different MSAL library versions.

### Version Resolution

```typescript
import { resolveVersion, VersionError } from '@equinor/fusion-framework-module-msal/versioning';

// Resolve and validate a version
const result = resolveVersion('2.0.0');
console.log(result.isLatest); // false
console.log(result.satisfiesLatest); // true
console.log(result.enumVersion); // MsalModuleVersion.V2
```

### Version Checking Behavior

- **Major Version Incompatibility**: Throws `VersionError` if requested major version is greater than latest
- **Minor Version Mismatch**: Logs warning but allows execution
- **Patch Differences**: Ignored for compatibility
- **Invalid Versions**: Throws `VersionError` with descriptive message

### API Reference

#### `resolveVersion(version: string | SemVer): ResolvedVersion`

Resolves and validates a version string against the latest available MSAL version.

**Parameters:**
- `version` - Version string or SemVer object to resolve

**Returns:** `ResolvedVersion` object containing:
- `wantedVersion: SemVer` - The parsed requested version
- `latestVersion: SemVer` - The latest available version
- `isLatest: boolean` - Whether the version is exactly the latest
- `satisfiesLatest: boolean` - Whether the major version matches latest
- `enumVersion: MsalModuleVersion` - Corresponding enum version

**Throws:** `VersionError` for invalid or incompatible versions

#### `VersionError`

Error class for version-related issues with the following types:
- `InvalidVersion` - Requested version is not a valid semver
- `InvalidLatestVersion` - Latest version parsing failed (build issue)
- `MajorIncompatibility` - Major version is greater than latest
- `MinorMismatch` - Minor version differs (warning only)
- `PatchDifference` - Patch version differs (info only)
- `IncompatibleVersion` - General incompatibility

### Error Handling

```typescript
import { resolveVersion, VersionError } from '@equinor/fusion-framework-module-msal/versioning';

try {
  const result = resolveVersion('3.0.0'); // Assuming latest is 2.x
} catch (error) {
  if (error instanceof VersionError) {
    console.error('Version error:', error.message);
    console.error('Requested:', error.requestedVersion);
    console.error('Latest:', error.latestVersion);
    console.error('Type:', error.type);
  }
}
```

## Additional Resources

- [Microsoft Graph API Documentation](https://docs.microsoft.com/en-us/graph/)
- [Azure AD App Registration Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [MSAL Browser Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser)
- [Fusion Framework Documentation](https://github.com/equinor/fusion-framework)



