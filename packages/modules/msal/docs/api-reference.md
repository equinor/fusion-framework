# MSAL API Reference

## `enableMSAL(configurator, configure?)`

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

## Type Definitions

### `LoginOptions`

```typescript
type LoginOptions = {
  request: PopupRequest | RedirectRequest;  // MSAL request object
  behavior?: 'popup' | 'redirect';          // Auth method (default: 'redirect')
  silent?: boolean;                         // Attempt silent auth first (default: true)
};
```

### `LogoutOptions`

```typescript
type LogoutOptions = {
  redirectUri?: string;                     // Redirect after logout
  account?: AccountInfo;                    // Account to logout (defaults to active)
};
```

### `AcquireTokenOptions`

```typescript
type AcquireTokenOptions = {
  request: PopupRequest | RedirectRequest;  // MSAL request with scopes
  behavior?: 'popup' | 'redirect';          // Auth method (default: 'redirect')
  silent?: boolean;                         // Attempt silent first (default: true if account available)
};
```

## `IMsalProvider`

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
