# Authentication & Authorization

Ensure results reference `@equinor/fusion-framework-module-msal` or `@equinor/fusion-framework-module-msal-node`.
Verify that mentioned functions, types, and configuration helpers are real exports from these packages.
Reject results that confuse browser MSAL with Node MSAL, or that reference removed v2-only APIs without noting the v4 migration path.

## How to enable and configure MSAL authentication in browser applications

- must mention `enableMSAL` from `@equinor/fusion-framework-module-msal`
- must show `builder.setClientConfig` with `auth.clientId` and `auth.tenantId`
- must mention `setRequiresAuth(true)` for automatic login during initialization
- should mention `auth.redirectUri` as an optional configuration property
- should mention that `@equinor/fusion-framework-app` enables MSAL by default
- should mention module hoisting so sub-modules inherit the parent auth provider

## How to acquire and manage access tokens

- must mention `acquireAccessToken` on the `IMsalProvider` interface
- must show the v4 request format with nested `request: { scopes: [...] }` object
- must mention `login` method with `silent`, `popup`, and `redirect` behaviors
- should mention `acquireToken` for obtaining the full `AuthenticationResult` instead of just the token string
- should mention `handleRedirect` for processing authentication redirects
- should mention that the legacy v2 format with flat `scopes` is still supported via proxy

## How to authenticate Node.js applications with MSAL

- must mention `enableAuthModule` from `@equinor/fusion-framework-module-msal-node`
- must show `setMode` with three modes: `interactive`, `silent`, and `token_only`
- must show `setClientConfig(tenantId, clientId)` for creating an MSAL client with secure persistence
- should mention `setAccessToken` for static token passthrough in CI/CD pipelines
- should mention `setServerPort` for the local callback server in interactive mode
- should mention secure credential caching via platform keychains (`@azure/msal-node-extensions`)

## How to handle authentication errors

- must mention `NoAccountsError` from `@equinor/fusion-framework-module-msal-node/error` for missing cached sessions
- must mention fallback from silent to interactive authentication when silent fails
- must show a try/catch pattern for token acquisition with error handling
- should mention `SilentTokenAcquisitionError` for expired sessions or network issues
- should mention `AuthServerError` and `AuthServerTimeoutError` for interactive mode failures

## How to configure OAuth scopes and permissions

- must show scopes in the format `api://your-app-id/.default` or `https://graph.microsoft.com/.default`
- must mention that scopes are passed via the `request` object in `acquireAccessToken`
- must mention `defaultScopes` on HTTP client configuration for per-client scope binding
- should mention that per-request scopes are appended to `defaultScopes` when both are set
- should mention that token acquisition only happens when the auth module is available and scopes are non-empty
