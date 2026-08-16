# Migration Guide

## MSAL v2 to v4 Migration

This package has been upgraded from MSAL Browser v2 to v4, providing the latest security improvements and features from Microsoft.

### What Changed in v4

**New MSAL Browser v4 Features:**
- Enhanced security with improved token management
- Better performance and memory usage
- New authentication API structure with nested request objects
- Improved error handling and retry mechanisms

**Architecture Changes:**
- **Module Hoisting**: The module uses module hoisting, meaning sub-module instances proxy the parent module instance
- **Shared Authentication State**: Authentication state is shared across all module instances
- **Async Initialization**: New `initialize()` method must be called before using the provider

### Breaking Changes

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

### Migration Steps

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

### Backward Compatibility

The module includes a **v2 proxy layer** that automatically converts v2 API calls to v4 format. This means:
- ✅ Existing code continues to work without changes
- ✅ Legacy format `{ scopes: [] }` is still supported
- ✅ Deprecated v2 properties like `defaultAccount` are available via v2 proxy (with deprecation warnings)
- ⚠️ New v4 features require using v4 format

### Benefits of Migration

- **Better Security**: Latest MSAL v4 security improvements and token handling
- **Improved Performance**: Faster token acquisition, better caching, reduced memory usage
- **Enhanced Error Handling**: More robust error recovery and retry mechanisms
- **Future-Proof**: Access to latest Microsoft authentication features and updates
- **Shared State**: Improved authentication state management across app scopes via module hoisting
- **Better Developer Experience**: Cleaner API, better TypeScript support, comprehensive documentation
