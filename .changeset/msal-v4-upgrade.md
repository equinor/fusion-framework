---
"@equinor/fusion-framework-module-msal": major
---

# MSAL v4 Upgrade

## What Changed

Upgraded from MSAL v2 to MSAL v4 with full backward compatibility, addressing the requirements outlined in [issue #3621](https://github.com/equinor/fusion-framework/issues/3621).

## Impact on Your Code

**✅ No breaking changes for existing code** - All current MSAL v2 API calls continue to work exactly as before.

**🚀 Enhanced features available** - New v4 APIs provide better performance, security, and error handling.

## What You Get

- **Better Security**: Latest MSAL v4 security improvements and vulnerability fixes
- **Improved Performance**: Faster token acquisition and caching
- **Enhanced Error Handling**: More robust error recovery and retry mechanisms
- **Future-Proof**: Access to latest Microsoft authentication features

## Migration (Optional)

**Current code works unchanged:**
```typescript
// Framework configuration still works exactly the same
const framework = await createFramework({
  modules: [enableMSAL()]
});

// Provider usage remains unchanged
const token = await framework.modules.auth.acquireToken({ scopes: ['User.Read'] });
```

**New v4 features available:**
```typescript
// Enhanced configuration with new options
const framework = await createFramework({
  modules: [enableMSAL()]
});

// Improved token acquisition with MSAL v4 request structure
const token = await framework.modules.auth.acquireToken({ 
  request: { scopes: ['User.Read'] },
  behavior: 'popup',
  silent: true 
});
```

## Breaking Changes

None for existing consumers. This is marked as major due to internal architecture changes, but the public API remains fully compatible.
