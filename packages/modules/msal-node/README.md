`@equinor/fusion-framework-module-msal-node` provides Azure AD authentication for Node.js applications using Microsoft's MSAL library. It targets CLI tools, background services, and automated pipelines that need to acquire Azure AD access tokens within the Fusion Framework module system.

## Features

- **Three authentication modes** — interactive (browser login), silent (cached credentials), and token-only (static token passthrough)
- **Secure token storage** — encrypted credential caching via platform keychains (Windows Credential Manager, macOS Keychain, Linux libsecret) using `@azure/msal-node-extensions`
- **Automatic token refresh** — silent re-acquisition of cached tokens without user interaction
- **Fusion Framework integration** — registers as the `auth` module and exposes `IAuthProvider` on the module instance

## Quick Start

```bash
pnpm add @equinor/fusion-framework-module-msal-node
```

```typescript
import { enableAuthModule } from '@equinor/fusion-framework-module-msal-node';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';

const configurator = new ModulesConfigurator();

enableAuthModule(configurator, (builder) => {
  builder.setMode('interactive');
  builder.setClientConfig('your-tenant-id', 'your-client-id');
  builder.setServerPort(3000);
});

// After initialization the auth provider is available on the module instance
const token = await modules.auth.acquireAccessToken({
  request: { scopes: ['https://graph.microsoft.com/.default'] },
});
```

## Architecture

The module registers under the name `auth` and produces an `IAuthProvider` instance during initialization. Which concrete provider class is created depends on the configured mode:

| Mode | Provider class | Behaviour |
|------|---------------|-----------|
| `interactive` | `AuthProviderInteractive` | Opens the default browser for OAuth 2.0 authorization code flow with PKCE, handled by a temporary local HTTP server |
| `silent` | `AuthProvider` | Acquires tokens silently from the MSAL cache; throws `NoAccountsError` if no cached session exists |
| `token_only` | `AuthTokenProvider` | Returns a static pre-supplied access token; login/logout are not supported |

All three implement `IAuthProvider`, so consuming code can call `acquireAccessToken` regardless of mode.

## Authentication Modes

### Interactive — browser-based login

Best for CLI tools, developer utilities, and any scenario requiring user sign-in.

```typescript
enableAuthModule(configurator, (builder) => {
  builder.setMode('interactive');
  builder.setClientConfig('your-tenant-id', 'your-client-id');
  builder.setServerPort(3000);
  builder.setServerOnOpen((url) => {
    console.log(`Open in browser: ${url}`);
  });
});

// Login explicitly (opens browser)
const result = await modules.auth.login({
  request: { scopes: ['https://graph.microsoft.com/.default'] },
});
console.log('Logged in as', result.account?.username);
```

### Silent — cached credentials

Best for background services and scheduled tasks where a user has previously authenticated.

```typescript
enableAuthModule(configurator, (builder) => {
  builder.setMode('silent');
  builder.setClientConfig(process.env.AZURE_TENANT_ID!, process.env.AZURE_CLIENT_ID!);
});

const token = await modules.auth.acquireAccessToken({
  request: { scopes: ['https://graph.microsoft.com/.default'] },
});
```

### Token-only — static token passthrough

Best for CI/CD pipelines and automation where a token is provided externally.

```typescript
enableAuthModule(configurator, (builder) => {
  builder.setMode('token_only');
  builder.setAccessToken(process.env.ACCESS_TOKEN!);
});

const token = await modules.auth.acquireAccessToken({
  request: { scopes: ['https://graph.microsoft.com/.default'] },
});
```

## Secure Token Storage

When using `setClientConfig`, the module creates a `PublicClientApplication` backed by an encrypted persistence cache from `@azure/msal-node-extensions`:

- **Platform keychains** — Windows Credential Manager, macOS Keychain, Linux libsecret
- **Encryption at rest** — tokens encrypted using platform-specific mechanisms
- **User-scoped** — cache files are scoped to the current OS user via `DataProtectionScope.CurrentUser`

The `libsecret`  dependency is loaded lazily so environments that use `token_only` mode (such as CI runners) do not need it installed.

## Configuration Reference

### `IAuthConfigurator` methods

| Method | Description |
|--------|-------------|
| `setMode(mode)` | Set authentication mode: `'interactive'`, `'silent'`, or `'token_only'` |
| `setClientConfig(tenantId, clientId)` | Create an MSAL client with secure persistence cache |
| `setClient(client)` | Provide a pre-configured `PublicClientApplication` instance |
| `setAccessToken(token)` | Set a static access token (`token_only` mode) |
| `setServerPort(port)` | Set the local callback server port (`interactive` mode) |
| `setServerOnOpen(callback)` | Callback invoked with the login URL when the server is ready |

### Required settings per mode

| Setting | `interactive` | `silent` | `token_only` |
|---------|:---:|:---:|:---:|
| `setClientConfig` or `setClient` | required | required | — |
| `setAccessToken` | — | — | required |
| `setServerPort` | required | — | — |

## Error Handling

The module exports dedicated error classes from `@equinor/fusion-framework-module-msal-node/error`:

| Error | Thrown when |
|-------|-----------|
| `NoAccountsError` | Silent token acquisition finds no cached accounts |
| `SilentTokenAcquisitionError` | MSAL fails to acquire a token silently (expired session, network issue) |
| `AuthServerError` | The local callback server receives no authorization code or token exchange fails |
| `AuthServerTimeoutError` | The callback server times out (default 5 minutes) waiting for a browser response |

```typescript
import { NoAccountsError } from '@equinor/fusion-framework-module-msal-node/error';

try {
  const token = await modules.auth.acquireAccessToken({
    request: { scopes: ['api://my-api/.default'] },
  });
} catch (error) {
  if (error instanceof NoAccountsError) {
    console.error('No cached session — run interactive login first');
  }
  throw error;
}
```

## API Reference

### `enableAuthModule(configurator, configure)`

Registers the MSAL Node module with a Fusion Framework `ModulesConfigurator`.

- **configurator** — the `IModulesConfigurator` instance
- **configure** — callback receiving an `IAuthConfigurator` builder

### `IAuthProvider`

Unified provider interface exposed as `modules.auth`:

```typescript
interface IAuthProvider {
  acquireAccessToken(options: {
    request: { scopes: string[] };
    interactive?: boolean;
  }): Promise<string>;

  login(options: { request: { scopes: string[] } }): Promise<AuthenticationResult>;

  logout(): Promise<void>;
}
```

`login` and `logout` are only functional in interactive mode. In other modes they throw immediately.


## Troubleshooting

### Common Issues

| Issue | Error Class | Solution |
|-------|------------|----------|
| **No cached session** | `NoAccountsError` | Run interactive login first to cache credentials, then retry with silent mode |
| **Silent auth fails** | `SilentTokenAcquisitionError` | Cached session may have expired or network is unavailable; fall back to interactive login |
| **Callback server fails** | `AuthServerError` | Check that the callback server port is not in use and the browser can reach it |
| **Callback server timeout** | `AuthServerTimeoutError` | The browser did not complete login within the timeout (default 5 min); retry or check network |
| **Invalid client/tenant ID** | — | Verify your Azure AD app registration settings |
| **Port already in use** | — | Change the `serverPort` or kill the process using the port |
| **Token expired** | — | The module handles refresh automatically; check your scopes |
| **Credential storage errors** | — | See our [credential storage guide](docs/libsecret.md) |

All error classes are exported from `@equinor/fusion-framework-module-msal-node/error`. A common pattern is to attempt silent token acquisition first and fall back to interactive login on failure:

```typescript
import { NoAccountsError, SilentTokenAcquisitionError } from '@equinor/fusion-framework-module-msal-node/error';

try {
  const token = await modules.auth.acquireAccessToken({
    request: { scopes: ['api://my-api/.default'] },
  });
} catch (error) {
  if (error instanceof NoAccountsError || error instanceof SilentTokenAcquisitionError) {
    // Fall back to interactive login
    await modules.auth.login({ request: { scopes: ['api://my-api/.default'] } });
  } else {
    throw error;
  }
}
```

### Getting Help

- 📖 [Credential Storage Troubleshooting](docs/libsecret.md) - Platform-specific setup help
- 🐛 [Report Issues](https://github.com/equinor/fusion/issues) - Bug reports and feature requests

## Additional Resources

- [Microsoft Graph API Documentation](https://docs.microsoft.com/en-us/graph/)
- [Azure AD App Registration Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [MSAL Node Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-node)
- [Fusion Framework Documentation](https://github.com/equinor/fusion-framework)

