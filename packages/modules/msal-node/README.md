`@equinor/fusion-framework-module-msal-node` provides secure Azure AD authentication for Node.js applications using Microsoft's MSAL (Microsoft Authentication Library). Perfect for CLI tools, background services, and automated processes that need to authenticate with Microsoft services.

## Features

- **Multiple Authentication Modes**: Choose the right auth flow for your use case
- **Secure Token Storage**: Encrypted credential storage using platform keychains
- **Easy Integration**: Simple API that works seamlessly with Fusion Framework
- **Token Management**: Automatic token refresh and caching
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Zero Configuration**: Sensible defaults with optional customization

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
  builder.setClientId('your-client-id');
  builder.setTenantId('your-tenant-id');
});

const framework = await initialize();
const token = await framework.auth.acquireAccessToken({ 
  scopes: ['https://graph.microsoft.com/.default'] 
});
```

## Authentication Modes

Choose the authentication mode that best fits your application's needs:

| Mode | Description | Best For | User Interaction |
|------|-------------|----------|------------------|
| **`token_only`** | Uses a pre-provided access token | CI/CD pipelines, serverless functions | None |
| **`silent`** | Uses cached credentials for background auth | Background services, scheduled tasks | None |
| **`interactive`** | Browser-based login with local server | CLI tools, development, user-facing apps | Required |

### When to Use Each Mode

- **`token_only`**: When you already have a valid access token (e.g., from environment variables, CI/CD secrets)
- **`silent`**: When you need background authentication without user interaction (e.g., scheduled jobs, background services)
- **`interactive`**: When you need user login (e.g., CLI tools, development environments, user-facing applications)

## Secure Token Storage

The module uses `@azure/msal-node-extensions` for enterprise-grade security:

- **🔒 Platform Keychains**: Windows Credential Manager, macOS Keychain, Linux libsecret
- **🔐 Encryption at Rest**: Tokens encrypted using platform-specific mechanisms
- **🔄 Automatic Refresh**: Seamless token renewal without user intervention
- **🌐 Cross-Platform**: Consistent security across Windows, macOS, and Linux

## Usage Examples

### Token-Only Mode (CI/CD)

Perfect for automated processes where you already have a valid token:

```typescript
import { enableAuthModule } from '@equinor/fusion-framework-module-msal-node';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';

const configurator = new ModulesConfigurator();

enableAuthModule(configurator, (builder) => {
  builder.setMode('token_only');
  builder.setAccessToken(process.env.ACCESS_TOKEN); // From CI/CD secrets
});

const framework = await initialize();
const token = await framework.auth.acquireAccessToken({ 
  scopes: ['https://graph.microsoft.com/.default'] 
});
```

### Silent Mode (Background Services)

For background services that need to authenticate without user interaction:

```typescript
import { enableAuthModule } from '@equinor/fusion-framework-module-msal-node';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';

const configurator = new ModulesConfigurator();

enableAuthModule(configurator, (builder) => {
  builder.setMode('silent');
  builder.setClientId(process.env.AZURE_CLIENT_ID);
  builder.setTenantId(process.env.AZURE_TENANT_ID);
});

const framework = await initialize();

// This will use cached credentials or fail if no valid cache exists
try {
  const token = await framework.auth.acquireAccessToken({ 
    scopes: ['https://graph.microsoft.com/.default'] 
  });
  console.log('Authenticated successfully');
} catch (error) {
  console.error('Silent authentication failed:', error.message);
}
```

### Interactive Mode (CLI Tools)

For CLI tools and development environments that require user login:

```typescript
import { enableAuthModule } from '@equinor/fusion-framework-module-msal-node';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';

const configurator = new ModulesConfigurator();

enableAuthModule(configurator, (builder) => {
  builder.setMode('interactive');
  builder.setClientId(process.env.AZURE_CLIENT_ID);
  builder.setTenantId(process.env.AZURE_TENANT_ID);
  builder.setServerPort(3000); // Optional: custom port
  builder.setServerOnOpen((url) => {
    console.log(`🌐 Please open your browser and navigate to: ${url}`);
  });
});

const framework = await initialize();

// This will open a browser for user login
const result = await framework.auth.login({ 
  scopes: ['https://graph.microsoft.com/.default'] 
});
console.log('Login successful:', result.account?.username);
```

## Configuration

### Required Settings

| Setting | Description | Required For |
|---------|-------------|--------------|
| `clientId` | Azure AD application client ID | `silent`, `interactive` |
| `tenantId` | Azure AD tenant ID | `silent`, `interactive` |
| `accessToken` | Pre-obtained access token | `token_only` |

### Optional Settings

| Setting | Description | Default | Mode |
|---------|-------------|---------|------|
| `serverPort` | Local server port for auth callbacks | `3000` | `interactive` |
| `serverOnOpen` | Callback when browser opens | `undefined` | `interactive` |

### Environment Variables

```bash
# Required for silent/interactive modes
AZURE_CLIENT_ID=your-client-id
AZURE_TENANT_ID=your-tenant-id

# Required for token_only mode
ACCESS_TOKEN=your-access-token
```

## API Reference

### `enableAuthModule(configurator, configure)`

Enables the MSAL Node module in your Fusion Framework application.

**Parameters:**
- `configurator`: `ModulesConfigurator` - The modules configurator instance
- `configure`: `(builder: IAuthConfigurator) => void` - Configuration function

### `IAuthProvider`

The authentication provider interface available at `framework.auth`:

```typescript
interface IAuthProvider {
  // Acquire an access token for the specified scopes
  acquireAccessToken(options: { 
    scopes: string[]; 
    interactive?: boolean 
  }): Promise<string>;
  
  // Login (interactive mode only)
  login(options: { scopes: string[] }): Promise<AuthenticationResult>;
  
  // Logout (interactive mode only)
  logout(): Promise<void>;
}
```


## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Invalid client/tenant ID** | Verify your Azure AD app registration settings |
| **Port already in use** | Change the `serverPort` or kill the process using the port |
| **Silent auth fails** | Ensure you've logged in interactively first to cache credentials |
| **Token expired** | The module handles refresh automatically; check your scopes |
| **Credential storage errors** | See our [credential storage guide](docs/libsecret.md) |

### Getting Help

- 📖 [Credential Storage Troubleshooting](docs/libsecret.md) - Platform-specific setup help
- 🐛 [Report Issues](https://github.com/equinor/fusion/issues) - Bug reports and feature requests

## Additional Resources

- [Microsoft Graph API Documentation](https://docs.microsoft.com/en-us/graph/)
- [Azure AD App Registration Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [MSAL Node Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-node)
- [Fusion Framework Documentation](https://github.com/equinor/fusion-framework)

