The Fusion Framework CLI provides secure, robust authentication for both automation and interactive development scenarios by leveraging Microsoft's MSAL (Microsoft Authentication Library) and Azure Active Directory (Azure AD). Authentication is handled through the Fusion Framework for Node.js, using the `@equinor/fusion-framework-module-msal-node` package, which is built on top of Microsoft's official `msal-node` library. This ensures standards-compliant, up-to-date authentication flows and seamless integration across Fusion Framework applications and tools.

For detailed information about the underlying authentication module, see the [MSAL Node Module documentation](https://equinor.github.io/fusion-framework/modules/auth/msal-node/).

## Key features
- **Multiple authentication modes:**
  - `token_only`: Use a pre-provided token (e.g., for CI/CD and automation).
  - `silent`: Acquire tokens silently using cached or refresh tokens (background services, scripts).
  - `interactive`: Prompt for authentication via a local HTTP server (CLI tools, development).
- **Secure token storage:** Tokens are encrypted at rest using platform-specific mechanisms (e.g., Secure Enclave on macOS, DPAPI on Windows).
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
```

- This will open a browser window for you to complete the Azure AD sign-in process.
- After successful login, your credentials are securely cached using platform-specific secure storage (e.g., Secure Enclave on macOS, DPAPI on Windows).
- You only need to log in once per session or until your token expires.

If you ever need to clear your cached credentials, you can run:

```sh
fusion-framework-cli auth logout
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
```

> [!TIP]
> The `--silent` flag outputs only the token (no extra logging), which is useful for exporting the token as an environment variable or saving it to a file for local testing or scripting:
> ```sh
> export FUSION_TOKEN=$(fusion-framework-cli auth token --silent)
> ```

> [!Note] This command requires an interactive user context and MSAL Node. It is not suitable for CI/CD environments, as there is no user available in those scenarios. Use it for local development, testing, or whenever you need to preserve a Fusion token for your own scripts or tools.

## CI/CD

### Setting the Fusion Token in GitHub

To publish or deploy your Fusion Framework app, you need to authenticate and set the `FUSION_TOKEN` environment variable. This token is required for secure access to Fusion APIs during CI/CD workflows.

You can obtain and set the `FUSION_TOKEN` using the Azure CLI as part of your pipeline steps. For example:

This ensures the `FUSION_TOKEN` is available as an environment variable for subsequent steps, such as publishing source code or config.

```yml
# This GitHub Action authenticates with Azure and retrieves an access token for use as FUSION_TOKEN.
#
# - The Azure Login step uses the azure/login action to authenticate with Azure using the provided client and tenant IDs.
# - The Get Access Token step runs the Azure CLI to acquire an access token for the specified scope, then sets it as the FUSION_TOKEN environment variable for subsequent steps.
#
# This makes the token available for publishing, deploying, or running Fusion CLI commands that require authentication.
#
# Example usage in a workflow:
#
# steps:
#   - name: Acquire Fusion Token
#     uses: ./.github/actions/fusion-token
#   - name: Fusion CLI command
#     run: fusion-framework-cli app check
#
# ---
# How to set up a Service Principal in Azure for CI/CD:
#
# 1. Sign in to Azure CLI:
#      az login
# 2. Create a new service principal (replace <NAME> and <SCOPE> as needed):
#      az ad sp create-for-rbac --name <NAME> --role contributor --scopes <SCOPE>
#    - This will output appId (client-id), password (client-secret), and tenant.
# 3. Grant the service principal API permissions if needed (e.g., to call Fusion APIs):
#    - In Azure Portal, go to Azure Active Directory > App registrations > [Your App] > API permissions.
#    - Add the required API permissions and grant admin consent.
# 4. Store the client-id, client-secret, and tenant-id as GitHub Action secrets.
# 5. Use these secrets in your workflow as shown below.
# 6. (Optional) For more on setting up environment variables in GitHub Actions workflows, see:
#    https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment
#
# For more details, see:
# https://learn.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal
# https://learn.microsoft.com/en-us/cli/azure/create-an-azure-service-principal-azure-cli
#
name: Azure Login and Get Access Token
description: Authenticates with Azure and retrieves an access token
inputs:
  client-id:
    description: >
      The Azure AD Application (client) ID to use for authentication. This should correspond to an app registration with permissions to request the required scopes.
    required: true
  tenant-id:
    description: >
      The Azure AD Tenant ID (directory) to authenticate against. This identifies the Azure AD instance where the app is registered.
    required: true
  scope:
    description: >
      The scope(s) for the access token, typically the Application ID URI of the API you want to access, followed by /.default (e.g., https://my-api/.default). Multiple scopes can be space-separated.
    required: true
runs:
  using: composite
  steps:
    - name: Azure Login
      uses: azure/login@v2
      with:
        client-id: ${{ inputs.client-id }}
        tenant-id: ${{ inputs.tenant-id }}
        allow-no-subscriptions: true
    - name: Get Access Token
      shell: bash
      run: |
        echo "FUSION_TOKEN=$(az account get-access-token --scope ${{ inputs.scope }} --query accessToken --output tsv)" >> $GITHUB_ENV

## Additional Resources

- [MSAL Node Module Documentation](https://equinor.github.io/fusion-framework/modules/auth/msal-node/) - Complete reference for the underlying authentication module
- [libsecret Setup Guide](https://equinor.github.io/fusion-framework/modules/auth/msal-node/docs/libsecret.html) - Platform-specific setup for secure credential storage on Linux systems
```