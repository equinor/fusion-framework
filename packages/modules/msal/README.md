
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
import { enableMSAL, initialize, type IMsalProvider } from '@equinor/fusion-framework-module-msal';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';

// 1. Configure the module
const configurator = new ModulesConfigurator();

enableMSAL(configurator, (builder) => {
  builder.setClientConfig({
    auth: {
      clientId: 'your-client-id',
      tenantId: 'your-tenant-id',
      redirectUri: 'https://your-app.com/callback'
    }
  });
  // With requiresAuth=true, the module will attempt automatic login during initialization
  // and await a valid authenticated account before initialization completes
  builder.setRequiresAuth(true);
});

// 2. Initialize the framework (auto-initializes auth provider)
const framework = await initialize(configurator);
const auth: IMsalProvider = framework.auth;

// 3. Optional: Handle authentication redirect manually (auto-called during initialization)
const redirectResult = await auth.handleRedirect();
if (redirectResult?.account) {
  console.log('Authenticated:', redirectResult.account.username);
}

// 4. Use authentication
// Option A: Token acquisition (v4 format - recommended)
const token = await auth.acquireAccessToken({ 
  request: { scopes: ['api://your-app-id/.default'] } 
});

// Option B: Legacy format (still supported via v2 proxy)
const legacyToken = await auth.acquireAccessToken({ 
  scopes: ['api://your-app-id/.default'] 
});

// Option C: Silent authentication with fallback
try {
  const result = await auth.login({ 
    request: { scopes: ['api://your-app-id/.default'] },
    silent: true  // Attempts SSO first
  });
} catch {
  // Fallback to interactive if silent fails
  await auth.login({ 
    request: { scopes: ['api://your-app-id/.default'] },
    behavior: 'popup'
  });
}
```

> [!IMPORTANT]
> The `@equinor/fusion-framework-app` enables this package by default, so applications using the app package do not need to enable this module manually.

## Backend-Issued Auth Code Flow

Enable automatic sign-in using a backend-issued authorization code without interactive login prompts.

### Overview

When your backend authenticates a user and generates a short-lived SPA auth code, the MSAL module can exchange it for tokens during initialization, eliminating double-login issues and providing seamless authentication.

### Usage

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

### How It Works

1. Backend authenticates user and generates short-lived auth code
2. Frontend passes auth code to MSAL: `builder.setAuthCode(authCode)`
3. During `initialize()`: auth code exchanged for tokens (before `requiresAuth` check)
4. Tokens cached by MSAL → user automatically signed in
5. Falls back to standard MSAL flows on exchange failure

### API: `setAuthCode(authCode: string)`

Sets backend-issued auth code for token exchange during initialization.

**Returns:** configurator instance (chainable)

**Behavior:**
- Exchange happens before `requiresAuth` check
- On success: user auto-authenticated, no login prompt
- On failure: falls back to standard MSAL login
- Auth code cleared after exchange (no reuse)

**Example:**

```typescript
// Best practice: Backend injects auth code on initial page load as window.MSAL_AUTH_CODE
if (typeof window !== 'undefined' && window.MSAL_AUTH_CODE) {
  builder.setAuthCode(window.MSAL_AUTH_CODE);
  delete (window as any).MSAL_AUTH_CODE; // Clear after consuming to prevent reuse
}
```

### Security

- ✅ Auth codes: single-use, short-lived (5-10 min)
- ✅ MSAL validates tokens from Microsoft authority
- ✅ Tokens stored securely, refresh tokens auto-managed
- ⚠️ Pass codes securely: HTTPS, HTTP-only cookies, or encrypted channels

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Auth code not exchanged | Verify `setAuthCode()` called before init |
| Invalid auth code error | Confirm backend `WithSpaAuthCode` enabled, code is fresh |
| Still shows login prompt | Check auth code exchange completes before `requiresAuth` check |
| Exchange fails | Auth code may have expired; backend should generate fresh code per load |

## Configuration

### Required Settings

| Setting | Description | Required |
|---------|-------------|----------|
| `auth.clientId` | Azure AD application client ID | ✅ |
| `auth.tenantId` | Azure AD tenant ID | ✅ |
| `auth.redirectUri` | Authentication callback URL | Optional |

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

### `enableMSAL(configurator, configure?)`

Enables the MSAL module in your Fusion Framework application.

**Parameters:**
- `configurator`: `IModulesConfigurator` - The modules configurator instance
- `configure?`: `(builder: { setClientConfig, setRequiresAuth }) => void` - Optional configuration function

**Returns:** `void`

**Example:**
```typescript
enableMSAL(configurator, (builder) => {
  builder.setClientConfig({ auth: { clientId: '...', tenantId: '...' } });
  builder.setRequiresAuth(true);
});
```

### Type Definitions

#### `LoginOptions`

```typescript
type LoginOptions = {
  request: PopupRequest | RedirectRequest;  // MSAL request object
  behavior?: 'popup' | 'redirect';          // Auth method (default: 'redirect')
  silent?: boolean;                         // Attempt silent auth first (default: true)
};
```

#### `LogoutOptions`

```typescript
type LogoutOptions = {
  redirectUri?: string;                     // Redirect after logout
  account?: AccountInfo;                    // Account to logout (defaults to active)
};
```

#### `AcquireTokenOptions`

```typescript
type AcquireTokenOptions = {
  request: PopupRequest | RedirectRequest;  // MSAL request with scopes
  behavior?: 'popup' | 'redirect';          // Auth method (default: 'redirect')
  silent?: boolean;                         // Attempt silent first (default: true if account available)
};
```

### `IMsalProvider`

The authentication provider interface available at `framework.auth`:

```typescript
interface IMsalProvider {
  // The MSAL PublicClientApplication instance
  readonly client: IMsalClient;
  
  // Current user account information
  readonly account: AccountInfo | null;
  
  // Initialize the MSAL provider
  initialize(): Promise<void>;
  
  // Acquire an access token for the specified scopes
  acquireAccessToken(options: AcquireTokenOptionsLegacy): Promise<string | undefined>;
  
  // Acquire full authentication result
  acquireToken(options: AcquireTokenOptionsLegacy): Promise<AcquireTokenResult>;
  
  // Login user interactively
  login(options: LoginOptions): Promise<LoginResult>;
  
  // Logout user (returns boolean)
  logout(options?: LogoutOptions): Promise<boolean>;
  
  // Handle authentication redirect (returns AuthenticationResult | null)
  handleRedirect(): Promise<AuthenticationResult | null>;
}

// Note: defaultAccount and other deprecated v2 properties are available only
//       when using a v2-compatible proxy via createProxyProvider()
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

1. **Auto-initialization via Framework**
   ```typescript
   // The provider initializes automatically when framework loads
   const framework = await initialize(configurator);
   const auth = framework.auth; // Already initialized
   
   // Manual initialization is only needed for standalone usage
   const provider = new MsalProvider(config);
   await provider.initialize();
   ```

2. **API Method Signature Updates**
   - `logout()` now returns `Promise<boolean>` instead of `Promise<void>`
   - `handleRedirect()` now returns `Promise<AuthenticationResult | null>` instead of `Promise<void>`
   - Methods now expect nested request objects (v4 format)

3. **Account Property Changes**
   - Use `account` property (returns `AccountInfo | null`) - v4 native
   - `defaultAccount` is deprecated and only available via v2 proxy layer
   - Migration: Replace `defaultAccount` with `account` throughout your code

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
       auth: {
         clientId: 'your-client-id',
         tenantId: 'your-tenant-id',
         redirectUri: 'https://your-app.com/callback'
       }
     });
     builder.setRequiresAuth(true);
   });
   ```

5. **Remove Duplicate Configurations**: Remove MSAL configuration from child modules

#### Backward Compatibility

The module includes a **v2 proxy layer** that automatically converts v2 API calls to v4 format. This means:
- ✅ Existing code continues to work without changes
- ✅ Legacy format `{ scopes: [] }` is still supported
- ✅ Deprecated v2 properties like `defaultAccount` are available via v2 proxy (with deprecation warnings)
- ⚠️ New v4 features require using v4 format

#### Benefits of Migration

- **Better Security**: Latest MSAL v4 security improvements and token handling
- **Improved Performance**: Faster token acquisition, better caching, reduced memory usage
- **Enhanced Error Handling**: More robust error recovery and retry mechanisms
- **Future-Proof**: Access to latest Microsoft authentication features and updates
- **Shared State**: Improved authentication state management across app scopes via module hoisting
- **Better Developer Experience**: Cleaner API, better TypeScript support, comprehensive documentation

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Authentication Loop** | Ensure redirect URIs match your application's routing |
| **Token Acquisition Fails** | Check that required scopes are properly configured |
| **Module Not Found** | Ensure the module is properly configured and framework is initialized |
| **Multiple MSAL Instances** | Remove duplicate configurations from child modules |
| **Redirect Returns Void** | For redirect flows, use `handleRedirect()` after navigation completes |
| **Token Empty/Undefined** | Verify user is authenticated and scopes are correct |

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

### Official Documentation
- 🔐 [Azure AD App Registration Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- 📚 [MSAL Browser Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser)
- 🏗️ [Fusion Framework Documentation](https://github.com/equinor/fusion-framework)
- 🌐 [Microsoft Identity Platform Overview](https://docs.microsoft.com/en-us/azure/active-directory/develop/)

### Learning Resources
- 📖 [MSAL Cookbook Examples](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-msal)
- 🎯 [OAuth 2.0 Scopes Explained](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent)
- 🛠️ [MSAL Troubleshooting Guide](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/errors.md)
- 📖 [Azure AD API Permissions Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-protected-web-api-app-registration)

### Support
- 💬 For questions: [Fusion Framework Discussions](https://github.com/equinor/fusion-framework/discussions)
- 🐛 Report bugs: [Fusion Framework Issues](https://github.com/equinor/fusion-framework/issues)
- 📧 Contact: Equinor Fusion Framework Team



