# `@equinor/fusion-framework-module-msal`

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

## Documentation

| Guide | Covers |
| --- | --- |
| [Configuration](./docs/api-reference.md) | `enableMSAL`, builder methods, `IMsalProvider`, and type definitions |
| [Backend-Issued Auth Code Flow](./docs/auth-code-flow.md) | Signing a user in from a backend-issued SPA auth code, without an interactive prompt |
| [Testing](./docs/testing.md) | The `/mock` entry point: in-process authentication, deterministic tokens, and spying |
| [Version Management](./docs/version-management.md) | Version resolution, compatibility checking, and related errors |
| [Migration v2 to v4](./docs/migration-v2-to-v4.md) | Moving from MSAL Browser v2 to v4, including the compatibility proxy |
| [Troubleshooting](./docs/troubleshooting.md) | Common failures and where to get help |

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

## Testing

Import from `@equinor/fusion-framework-module-msal/mock` to authenticate in-process instead of against Entra ID. The real configurator, provider and schema validation still run — only the client that would contact Entra ID is substituted.

```typescript
import { enableMsalMock } from '@equinor/fusion-framework-module-msal/mock';

enableMsalMock(configurator);
```

A user named `Test User` is signed in, and tokens are real JWTs minted in-process with a fixed issue time, so they are identical across runs and machines.

The entry point has **no test-runner dependency**, and ships no mocking API of its own — spying on a call is your test runner's job.

See [Testing](./docs/testing.md) for choosing the signed-in user, signed-out behaviour and runner guidance, or [`@equinor/fusion-framework/mock`](../../framework/docs/testing.md) to mock every framework boundary at once.

## Module Hoisting

The module implements a hoisting pattern where the authentication provider is created once at the root level and shared across all sub-modules. This ensures consistent authentication state throughout your application while maintaining security and performance.

> [!IMPORTANT]
> **Configure the auth module only in the root Fusion Framework instance** - Sub-instances will automatically inherit the authentication configuration from the parent.

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
