# @equinor/fusion-framework-module-azure-identity

Azure Identity authentication module for the Fusion Framework.
Provides three authentication modes — ambient credentials, interactive browser login, and static token — all registering under the `'auth'` module slot as a drop-in replacement for `@equinor/fusion-framework-module-msal-node`.

## When to use

| Scenario | Mode |
|---|---|
| CI/CD with OIDC (GitHub Actions `azure/login`, Azure Pipelines) | `default_credential` |
| Managed identity (Azure VMs, App Service, Container Apps) | `default_credential` |
| Azure CLI login (`az login`) flowing through automatically | `default_credential` |
| CLI tools requiring user sign-in via browser | `interactive` |
| Scripts with a pre-obtained `FUSION_TOKEN` | `token_only` |

Both this module and `@equinor/fusion-framework-module-msal-node` register under the `'auth'` slot, so only one can be active at a time.

## Install

```sh
pnpm add @equinor/fusion-framework-module-azure-identity
```

## Quick start

### Default credential (CI/CD, managed identity)

No configuration needed — credentials are resolved from the environment automatically.

```typescript
import { enableAzureIdentityAuth } from '@equinor/fusion-framework-module-azure-identity';

enableAzureIdentityAuth(configurator);
```

### Interactive browser login

Opens the user's default browser for Azure AD login. Tokens and the `AuthenticationRecord` are cached to the OS keychain so subsequent invocations resolve silently.

```typescript
import { enableAzureIdentityInteractive } from '@equinor/fusion-framework-module-azure-identity';

enableAzureIdentityInteractive(configurator, {
  tenantId: '3aa4a235-...',
  clientId: 'a318b8e1-...',
  redirectPort: 49741,
  onOpen: (url) => console.log(`Open: ${url}`),
});
```

### Static token

Use a pre-obtained access token. Login and logout are not supported.

```typescript
import { enableAzureIdentityTokenOnly } from '@equinor/fusion-framework-module-azure-identity';

enableAzureIdentityTokenOnly(configurator, process.env.FUSION_TOKEN!);
```

### Acquiring tokens

After initialisation, acquire tokens the same way as with the MSAL module:

```typescript
const token = await framework.auth.acquireAccessToken({
  request: { scopes: ['api://my-api/.default'] },
});
```

## Authentication modes

### `default_credential` — ambient environment

Uses `DefaultAzureCredential` which tries these sources in order:

1. **Environment variables** (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_FEDERATED_TOKEN_FILE`, etc.)
2. **Workload identity** (Kubernetes pods with Azure Workload Identity)
3. **Managed identity** (Azure VMs, App Service, Container Apps)
4. **Azure CLI** (`az login` session)
5. **Azure PowerShell** (`Connect-AzAccount` session)
6. **Azure Developer CLI** (`azd auth login` session)

In GitHub Actions after `azure/login@v3` with OIDC, option 1 is used automatically.

`login()` and `logout()` throw — there is no interactive session to manage.

### `interactive` — browser-based login

Uses `InteractiveBrowserCredential` with an authorization code flow through a localhost redirect. Designed for CLI tools (`ffc auth login`, `ffc auth token`).

- On first run, opens the browser for Azure AD login
- Saves the `AuthenticationRecord` to OS-level secure storage via `@azure/msal-node-extensions` (Keychain on macOS, DPAPI on Windows, libsecret on Linux)
- On subsequent runs, loads the record and acquires tokens silently from the cached credential

```typescript
// Explicit login (opens browser)
const record = await framework.auth.login({
  request: { scopes: ['api://my-api/.default'] },
});
console.log('Logged in as', record.username);

// Silent token acquisition (no browser)
const token = await framework.auth.acquireAccessToken({
  request: { scopes: ['api://my-api/.default'] },
});

// Clear cached credentials
await framework.auth.logout();
```

### `token_only` — static access token

Returns a pre-obtained token string. `login()` and `logout()` throw.

## Token cache persistence

The module registers `cachePersistencePlugin` from `@azure/identity-cache-persistence` at load time, enabling encrypted OS-level token caching:

| Platform | Backend |
|---|---|
| macOS | Keychain |
| Windows | DPAPI |
| Linux | libsecret |

In `interactive` mode, the `AuthenticationRecord` (account metadata that tells the credential which cached tokens to look up) is additionally stored via `@azure/msal-node-extensions` secure persistence.

## Configurator API

The generic `enableAzureIdentityAuth` accepts a callback for full control:

```typescript
enableAzureIdentityAuth(configurator, (builder) => {
  // Option A — mode-specific setter
  builder.setInteractive({ tenantId, clientId, redirectPort: 49741 });

  // Option B — full config object (discriminated union)
  builder.setConfig({
    mode: 'interactive',
    tenantId,
    clientId,
    redirectPort: 49741,
  });

  // Option C — default credential (no args)
  builder.setDefaultCredential();

  // Option D — static token
  builder.setTokenOnly(token);
});
```

## Exports

| Export | Description |
|---|---|
| `enableAzureIdentityAuth` | Generic enabler with configurator callback |
| `enableAzureIdentityDefaultCredential` | One-liner enabler for `default_credential` mode |
| `enableAzureIdentityInteractive` | One-liner enabler for `interactive` mode |
| `enableAzureIdentityTokenOnly` | One-liner enabler for `token_only` mode |
| `AzureIdentityAuthConfigurator` | Configurator class with type-safe setters |
| `AzureIdentityAuthConfig` | Discriminated union config type |
| `InteractiveAuthOptions` | Options for interactive mode |
| `AuthProviderDefaultCredential` | Provider class for ambient credentials |
| `AuthProviderInteractiveBrowser` | Provider class for browser login |
| `AuthProviderTokenOnly` | Provider class for static tokens |
| `IAuthProvider` | Auth provider interface |
| `AzureIdentityModule` | Module type for generic parameters |
| `azureIdentityModule` | Raw module definition |
