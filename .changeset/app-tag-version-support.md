---
"@equinor/fusion-framework-module-app": minor
"@equinor/fusion-framework-dev-portal": patch
---

# Add app tag/version support for specific app builds

This changeset introduces comprehensive support for loading specific app versions using tags, enabling developers to test different app builds and manage version-specific deployments.

## New Features

### App Tag/Version Support
- **App Client**: Added `getAppBuild` method to fetch build manifests by app key and tag
- **App Module Provider**: Enhanced `getAppManifest` to accept optional tag parameter
- **App Loading**: Modified `setCurrentApp` to support `AppReference` objects with tag specification
- **URL Integration**: Added `getAppTagFromUrl` utility to extract app tags from URL parameters

### Enhanced Type System
- Added `AppReference` type for specifying app key and optional tag
- Extended `AppBundleState` to include optional `tag` property
- Updated `AppBuildManifest` type definition for build-specific metadata

### API Improvements
- **AppClient**: Updated interface to support tag-based manifest and build fetching
- **App Class**: Added `tag` getter property for accessing current app tag
- **Action System**: Enhanced `fetchManifest` action to handle tag parameters

## Changes by Package

### `@equinor/fusion-framework-module-app`
- **AppClient.ts**: Added `getAppBuild` method with tag support and updated `getAppManifest` signature
- **AppModuleProvider.ts**: Enhanced `setCurrentApp` method to handle `AppReference` objects with tags
- **App.ts**: Added `tag` getter and improved error handling in initialization
- **types.ts**: Added `AppReference` type and extended `AppBundleState` with tag property
- **actions.ts**: Updated `fetchManifest` action to accept tag parameter
- **flows.ts**: Modified manifest fetching flow to handle tag-based requests

### `@equinor/fusion-framework-dev-portal`
- **AppLoader.tsx**: Added `getAppTagFromUrl` utility function and integrated tag-based app loading

## Usage Examples

### Loading specific app version by tag
```typescript
// Set current app with specific tag
app.setCurrentApp({ appKey: 'my-app', tag: 'v1.2.3' });

// Extract tag from URL and load app
const tag = getAppTagFromUrl();
if (tag) {
  app.setCurrentApp({ appKey: 'my-app', tag });
}
```

### Fetching app builds
```typescript
// Get build manifest for specific tag
const buildManifest = await appClient.getAppBuild({ 
  appKey: 'my-app', 
  tag: 'latest' 
});
```

## Migration Guide

### For App Consumers
- No breaking changes - existing code continues to work
- Optionally use new tag-based loading for version-specific deployments

### For App Developers
- Consider adding `aTag` URL parameter support for testing different versions
- Use new `AppReference` type when programmatically setting current apps with tags

## Technical Details

- **Backward Compatibility**: All changes are backward compatible
- **Caching**: Tag-based manifests and builds are cached separately
- **Error Handling**: Enhanced error handling for build and manifest loading failures
- **Type Safety**: Full TypeScript support for all new features