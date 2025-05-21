# Fusion MSAL Node Module

`@equinor/fusion-framework-msal-node` enables secure authentication for the Fusion Framework in Node.js environments using Microsoft's MSAL (Microsoft Authentication Library) to integrate with Azure Active Directory (Azure AD).

## Features

- **Simple Token Acquisition**: Easy-to-use API for acquiring authentication tokens.
- **Multiple Auth Flows**: Supports client credentials and other Azure AD authentication flows.
- **Token Caching**: Built-in caching for improved performance and security.
- **Fusion Framework Integration**: Seamless authentication across Fusion Framework applications.
- **Authentication Modes**:
  - `token_only`: Uses a pre-provided token for authentication (e.g., CI/CD, automation).
  - `silent`: Acquires tokens silently using cached or refresh tokens (background services, scripts).
  - `interactive`: Prompts users for authentication via a local HTTP server (CLI tools, development).

## Authentication Modes

The module supports three authentication modes to suit different use cases:

| Mode          | Description                                                                  | Use Case                                   |
| ------------- | ---------------------------------------------------------------------------- | ------------------------------------------ |
| `token_only`  | Uses a pre-obtained token, typically from environment variables.             | CI/CD pipelines, automated processes.      |
| `silent`      | Acquires tokens silently using cached or refresh tokens, without user input. | Background services, pre-seeding commands. |
| `interactive` | Prompts user login via a browser, using a local HTTP server for callbacks.   | CLI tools, development, manual operations. |

### `token_only`
Ideal for scenarios where a token is already available (e.g., via CI/CD). No interaction with Azure AD is required.

### `silent`
Uses cached or refresh tokens to authenticate without user interaction. Perfect for automated or background tasks.

### `interactive`
Requires user interaction, launching a local HTTP server to handle browser-based authentication. Suitable for CLI or development workflows.

## Secure Token Storage

The module leverages `@azure/msal-node-extensions` for secure, encrypted token storage:

- **Encryption**: Tokens are encrypted at rest using platform-specific mechanisms (e.g., DPAPI on Windows, Keychain on macOS).
- **Cross-Platform**: Supports Windows, macOS, and Linux.
- **Persistence**: Tokens are stored securely for reuse across sessions, minimizing re-authentication.

This ensures sensitive token data is protected, reducing the risk of unauthorized access.

## Usage

Below are examples for enabling the module in each authentication mode.

### `token_only` Mode

Use a pre-obtained token for authentication.

```ts
import { enableAuthModule, type MsalNodeModule } from '@equinor/fusion-framework-msal-node';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';

const configurator = new ModulesConfigurator<[MsalNodeModule]>();

enableAuthModule(configurator, (builder) => {
  builder.setMode('token_only');
  builder.setAccessToken('your-access-token'); // Provide your token
});

const instance = await initialize();
console.log(typeof instance.auth); // AuthTokenProvider
console.log(await instance.auth.acquireAccessToken({ scopes: ['user.read'] }));
```

### `silent` Mode

Authenticate silently using cached or refresh tokens.

```ts
import { enableAuthModule, type MsalNodeModule } from '@equinor/fusion-framework-msal-node';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';

const configurator = new ModulesConfigurator<[MsalNodeModule]>();

enableAuthModule(configurator, (builder) => {
  builder.setMode('silent');
  builder.setClientId('your-client-id'); // Azure AD client ID
  builder.setTenantId('your-tenant-id'); // Azure AD tenant ID
});

const instance = await initialize();
console.log(typeof instance.auth); // AuthTokenProvider
console.log(await instance.auth.acquireAccessToken({ scopes: ['user.read'] }));
```

### `interactive` Mode

Prompt the user for browser-based authentication.

```ts
import { enableAuthModule, type MsalNodeModule } from '@equinor/fusion-framework-msal-node';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';

const configurator = new ModulesConfigurator<[MsalNodeModule]>();

enableAuthModule(configurator, (builder) => {
  builder.setMode('interactive');
  builder.setClientId('your-client-id'); // Azure AD client ID
  builder.setTenantId('your-tenant-id'); // Azure AD tenant ID
  builder.setServerPort(3000); // Local server port for auth callback
  builder.setServerOnOpen((url) => {
    console.log(`Please navigate to: ${url}`);
  });
});

const instance = await initialize();
console.log(typeof instance.auth); // AuthProviderInteractive
console.log(await instance.auth.login({ scopes: ['user.read'] }));
```

## Configuration

- **Client ID and Tenant ID**: Obtain these from your Azure AD application registration.
- **Scopes**: Specify required permissions (e.g., `['user.read']`) when acquiring tokens.
- **Server Port**: For `interactive` mode, ensure the port is available and not blocked by firewalls.

## Troubleshooting

- **Token Issues**: Verify your token, client ID, or tenant ID are correct.
- **Interactive Mode Fails**: Check if the specified port is free and accessible.
- **Silent Mode Fails**: Ensure cached tokens or refresh tokens are valid.
