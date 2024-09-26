---
'@equinor/fusion-framework-cli': minor
---

**App Assets Export Plugin**

Create a plugin that exports assets from the app's source code.
This plugin resolves the issue where assets are not extracted from the app's source code since the app is in `lib` mode.

```typescript
export default {
  plugins: [
    AppAssetExportPlugin(
      include: createExtensionFilterPattern(
        manifest.build.allowedExtensions
        ),
    ),
  ]
}
```

see readme for more information.
