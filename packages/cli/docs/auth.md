The Fusion Framework CLI provides secure, robust authentication for both automation and interactive development scenarios using Azure Identity and Azure Active Directory (Azure AD). Authentication is handled through the `@equinor/fusion-framework-module-azure-identity` package, which wraps `@azure/identity` credentials with OS-level token caching via `@azure/identity-cache-persistence`. This ensures standards-compliant, up-to-date authentication flows and seamless integration across Fusion Framework applications and tools.

For detailed information about the underlying authentication module, see the [Azure Identity Module README](../../packages/modules/azure-identity/README.md).

> [!TIP]
> The CLI exposes two binary aliases: `fusion-framework-cli` and `ffc`. All examples below use the long form, but you can substitute `ffc` anywhere — e.g. `ffc auth login`, `ffc auth token`.

## Key features
- **Multiple authentication modes:**
  - `interactive`: Browser-based Azure AD login with OS-level token caching (CLI tools, development).
  - `default_credential`: Ambient credential chain — environment variables, managed identity, Azure CLI (CI/CD, infrastructure).
  - `token_only`: Use a pre-provided token (e.g., for CI/CD and automation).
- **Secure token storage:** Tokens and authentication records are encrypted at rest using platform-specific mechanisms (Keychain on macOS, DPAPI on Windows, libsecret on Linux) via `@azure/msal-node-extensions`.
- **Consistent experience:** The same authentication logic and token handling is used across CLI and app environments.

## Azure AD Concepts: Tenant, Client App, and Scopes

When configuring authentication for the Fusion Framework CLI, you will encounter several Azure Active Directory (Azure AD) concepts:

### Tenant
- The **tenant** is your organization's Azure AD directory. It is identified by a unique tenant ID (a GUID) or a domain name (e.g., `contoso.onmicrosoft.com`).
- The tenant controls user identities, app registrations, and access policies.
- **For most use cases, you do not need to specify the tenant—by default, the CLI uses the Equinor tenant.**

### Client App (Application Registration)
- The **client app** refers to an application registered in your Azure AD tenant. This registration provides a unique **client ID** used to identify your app when requesting tokens.
- **The Fusion Framework CLI uses the default Fusion CLI app registration for authentication, so you do not need to provide a client ID.**
- The client app registration defines what permissions (scopes) your app can request and how it can authenticate (e.g., client credentials, interactive login).

### Scopes
- **Scopes** define the permissions your app is requesting when acquiring an access token. Scopes are typically in the form of URLs (e.g., `https://my-service.com/.default` or a custom API scope).
- The scopes you request must be granted to your client app registration in Azure AD.
- When using the CLI or configuring CI/CD, you should provide the scopes required for your target environment or API.

> [!TIP]
> For most development and deployment scenarios, the CLI provides sensible defaults for tenant and client app. You only need to specify the scopes required for your specific target environment or API.

## Local Development

### Login in with the CLI

For local development, you should authenticate interactively using the CLI's built-in login command. This uses the `interactive` authentication mode, which will prompt you to sign in via your browser and securely store your credentials for future CLI commands.

To log in, run:

```sh
fusion-framework-cli auth login
# or using the short alias
ffc auth login
```

- This will open a browser window for you to complete the Azure AD sign-in process.
- After successful login, your credentials are securely cached using platform-specific secure storage (e.g., Secure Enclave on macOS, DPAPI on Windows).
- You only need to log in once per session or until your token expires.

If you ever need to clear your cached credentials, you can run:

```sh
fusion-framework-cli auth logout
# or: ffc auth logout
```

This will remove your stored tokens and require you to log in again for future CLI operations.

### Authentication Options in Development

The CLI provides several authentication-related options for advanced scenarios or custom environments:

- **--tenantId**: The Azure Active Directory tenant ID. You can override the default using this option or the `FUSION_TENANT_ID` environment variable. For most users, this is not required.
- **--clientId**: The client ID of the application registered in Azure AD. You can override the default using this option or the `FUSION_CLIENT_ID` environment variable. For most users, this is not required.
- **--token**: The Azure AD access token. If provided (or set via `FUSION_TOKEN`), tenant and client options are ignored for that command. This is useful for advanced automation or CI/CD scenarios.
- **--scope**: One or more Azure audience scopes, usually the application ID URI of the API you want to access, followed by `.default`. You can override the default using this option or the `FUSION_AUTH_SCOPE` environment variable. This is the most common option to change for custom API access.

**How these options work:**
- If you provide a token, tenant and client options are ignored for that command.
- Tenant and client IDs must be valid UUIDs if specified.
- Scopes must be non-empty strings.

These options allow you to use the CLI with custom tenants, client apps, or tokens if needed, but for most development scenarios, the built-in defaults are sufficient and only the `--scope` option is commonly changed. This flexibility supports both simple and advanced authentication needs, making it easy to get started while enabling custom setups for more complex environments.

### Acquiring token

The `auth token` command is designed to show your access token for the current user.

```sh
fusion-framework-cli auth token
# or using the short alias
ffc auth token
```

> [!TIP]
> The `--silent` flag outputs only the token (no extra logging), which is useful for exporting the token as an environment variable or saving it to a file for local testing or scripting:
> ```sh
> export FUSION_TOKEN=$(fusion-framework-cli auth token --silent)
> # or: export FUSION_TOKEN=$(ffc auth token --silent)
> ```

> [!Note] This command requires an interactive user context. It is not suitable for CI/CD environments, as there is no user available in those scenarios. Use it for local development, testing, or whenever you need to preserve a Fusion token for your own scripts or tools.

## CI/CD

### Authentication in GitHub Actions

For CI/CD, authenticate with Azure using `azure/login@v2` and run the CLI command directly.

When running in CI and no `--token`/`FUSION_TOKEN` is provided, the CLI automatically uses Azure Identity `default_credential` (`DefaultAzureCredential`). This works with OIDC federation, managed identities, and other ambient credentials.

```yml
name: Publish app
on:
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Azure Login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          allow-no-subscriptions: true

      - name: Publish to Fusion
        run: ffc app publish --env ci ./dist/app.zip
```

### Optional Explicit Token Mode

You can still provide an explicit token with `--token` or `FUSION_TOKEN` when needed.

```yml
- name: Acquire token (optional)
  run: |
    echo "FUSION_TOKEN=$(az account get-access-token --scope ${{ vars.FUSION_SCOPE }} --query accessToken --output tsv)" >> $GITHUB_ENV

- name: Publish with explicit token
  run: ffc app publish --env ci ./dist/app.zip
```

## Additional Resources

- [Azure Identity Module README](../../packages/modules/azure-identity/README.md) - Complete reference for the underlying authentication module
- [Azure Identity documentation](https://learn.microsoft.com/en-us/javascript/api/overview/azure/identity-readme) - Microsoft's official Azure Identity SDK docs
- [libsecret Setup Guide](https://learn.microsoft.com/en-us/javascript/api/overview/azure/identity-cache-persistence-readme) - Platform-specific setup for secure credential storage
```