## App Assets Plugin

The App Assets plugin is a CLI plugin that allows you to manage your app's assets.
This plugin resolves the issue where assets are not extracted from the app's source code since the app is in `lib` mode.

There are plugins which extract assets from the app's source code, but they will not generate the correct paths for the assets.
secondly, the assets will have a generic `import` which means all assets will be loaded as soon as the app `entrypoint` is loaded.

> the magic sauce is injecting an `URL` creation with base of the import path of the loaded script.
> ```typescript
> // injected code by plugin
> export default new URL(assetPath, import.meta.url).href
>```

### Configuration

```typescript
export default {
  plugins: [
    AppAssetExportPlugin(),
  ]
}
```

### AssetFilter

Method to create a filter pattern for the plugin to include or exclude files.

```typescript
AppAssetExportPlugin(
  include: createExtensionFilterPattern([
      'png', 'jpg', 'jpeg', 'gif',
  ]),
  exclude: createExtensionFilterPattern([
      'svg',
  ]),
),
```

```typescript
AppAssetExportPlugin(
  include: createExtensionFilterPattern(
    manifest.build.allowedExtensions
  ),
),
```

### Options

#### name
Output name of the resource file, its usage aligns with the name option of the file-loader.

```typescript
AppAssetExportPlugin({
  // default: '[name].[ext]'
  name: '[name].[contenthash:8].[ext]?[query]'
})
```

#### include
A valid [picomatch](https://github.com/micromatch/picomatch#globbing-features) pattern, or array of patterns indicate which files need to be handled by the plugin.

```typescript
AppAssetExportPlugin({
  // default: see static file extensions
  include: /\.a?png(\?.*)?$/
})
```

#### exclude
A valid [picomatch](https://github.com/micromatch/picomatch#globbing-features) pattern, or array of patterns indicate which files need to be handled by the plugin.

```typescript
AppAssetExportPlugin({
  // default: undefined
  exclude: /\.a?svg(\?.*)?$/
})
```