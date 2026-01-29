---
"@equinor/fusion-framework-module-app": minor
---

Allow custom string values for app build tags instead of restricting to 'latest' and 'preview'.

The app module schema now accepts any string value for the `tag` field in `AppBuildManifest` and `ApiApplicationBuildSchema`. This enables using custom deployment tags like `dev`, `staging`, `v1.0`, or any other string value while maintaining backward compatibility with existing `latest` and `preview` tags.

```typescript
// Before: only 'latest' | 'preview' allowed
const build: AppBuildManifest = {
  version: '1.0.0',
  entryPoint: 'index.js',
  tag: 'latest' // or 'preview' only
};

// After: any string value allowed
const build: AppBuildManifest = {
  version: '1.0.0', 
  entryPoint: 'index.js',
  tag: 'dev' // or 'staging', 'v1.0', etc.
};
```

This aligns the schema validation with the CLI's existing flexibility for custom tags.

Fixes: https://github.com/equinor/fusion-core-tasks/issues/252