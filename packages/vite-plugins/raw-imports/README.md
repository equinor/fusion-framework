# Fusion Framework Vite Plugin - Raw Imports

This Vite plugin enables importing files as raw strings using the `?raw` query parameter. While Vite has built-in support for `?raw` imports, this plugin ensures consistent behavior in library mode (`build.lib`) and handles edge cases with relative path resolution that may not work with Vite's default implementation.

## Features

- **Library Mode Support**: Works reliably in Vite library builds (`build.lib`) where native `?raw` support may be inconsistent
- **Relative Path Support**: Handles relative paths with `../` correctly, including edge cases
- **Consistent Behavior**: Ensures `?raw` imports work the same way across all build modes
- **Automatic Integration**: Included by default in Fusion Framework CLI builds
- **TypeScript Support**: Full TypeScript support with proper type definitions

> **Note**: Vite does support `?raw` imports natively, but this plugin ensures reliable behavior in library mode and handles path resolution edge cases that may not work with Vite's default implementation.

## Installation

This plugin is automatically included when using `@equinor/fusion-framework-cli` for building applications. If you need to use it manually:

```bash
pnpm add -D @equinor/fusion-framework-vite-plugin-raw-imports
```

## Usage

### Basic Usage

Import any file as a raw string:

```typescript
import readmeContent from '../../README.md?raw';

console.log(readmeContent); // The raw markdown content as a string
```

### In React Components

```tsx
import readmeContent from '../../README.md?raw';
import '@equinor/fusion-wc-markdown/markdown-viewer';

export default function HomePage() {
  return <fwc-markdown-viewer>{readmeContent}</fwc-markdown-viewer>;
}
```

### With TypeScript

Add type definitions for `?raw` imports:

```typescript
// types/markdown.d.ts
declare module '*.md?raw' {
  const content: string;
  export default content;
}
```

### Manual Plugin Configuration

If you're not using the Fusion Framework CLI, add the plugin to your Vite config:

```typescript
import { defineConfig } from 'vite';
import { rawImportsPlugin } from '@equinor/fusion-framework-vite-plugin-raw-imports';

export default defineConfig({
  plugins: [
    rawImportsPlugin(),
    // ... other plugins
  ],
});
```

### Customizing File Extensions

By default, the plugin only handles `.md` files. To handle additional file types, configure the `extensions` option:

```typescript
import { rawImportsPlugin } from '@equinor/fusion-framework-vite-plugin-raw-imports';

export default defineConfig({
  plugins: [
    rawImportsPlugin({
      extensions: ['.md', '.txt', '.json'], // Add more extensions as needed
    }),
  ],
});
```

> **Note**: Files with extensions not listed in the `extensions` option will be handled by Vite's built-in `?raw` support, ensuring compatibility with existing image imports and other file types.

## How It Works

1. **Import Detection**: The plugin intercepts imports ending with `?raw`
2. **Path Resolution**: Resolves the file path relative to the importing file
3. **Content Loading**: Reads the file content from disk
4. **Module Generation**: Returns a JavaScript module with the content as a default export

The plugin uses Vite's `resolveId` and `load` hooks to:
- Create a virtual module for each `?raw` import
- Resolve paths correctly relative to the importing file
- Read and return the file content as a string

## Supported File Types

By default, the plugin only handles markdown files (`.md`). This ensures that:
- Image imports with `?raw` (like `image.png?raw`) continue to work with Vite's built-in handler
- Other file types use Vite's native `?raw` support
- Only markdown files get the special library mode handling

You can configure additional extensions if needed (see [Customizing File Extensions](#customizing-file-extensions)).

## Path Resolution

The plugin handles various path formats:

```typescript
// Relative paths
import content from './file.md?raw';
import content from '../README.md?raw';
import content from '../../docs/guide.md?raw';

// Absolute paths (resolved from project root)
import content from '/src/docs/guide.md?raw';
```

Paths are resolved relative to the importing file's directory, ensuring correct resolution regardless of the file structure.

## Error Handling

If a file cannot be read, the plugin throws a descriptive error:

```
Failed to read file: /path/to/file.md. ENOENT: no such file or directory
```

This helps identify missing files or incorrect paths during development.

## Integration with Fusion Framework

This plugin is automatically included in all Vite builds when using `@equinor/fusion-framework-cli`. No additional configuration is required.

## Examples

### Displaying README Content

```tsx
import readmeContent from '../../README.md?raw';
import '@equinor/fusion-wc-markdown/markdown-viewer';

export default function AboutPage() {
  return (
    <div>
      <fwc-markdown-viewer>{readmeContent}</fwc-markdown-viewer>
    </div>
  );
}
```

### Loading Configuration Files

```typescript
import configTemplate from './config.template.json?raw';

const config = JSON.parse(configTemplate);
```

### Loading Text Content

```typescript
import licenseText from '../../LICENSE?raw';

console.log('License:', licenseText);
```

## API Reference

### `rawImportsPlugin(options?)`

Creates a Vite plugin instance that handles `?raw` imports for configured file extensions.

**Parameters:**
- `options` (optional): Configuration options
  - `extensions?: string[]` - File extensions to handle (default: `['.md']`)

**Returns:** `Plugin` - A Vite plugin object

**Example:**

```typescript
import { rawImportsPlugin } from '@equinor/fusion-framework-vite-plugin-raw-imports';

// Default: only handles .md files
export default {
  plugins: [rawImportsPlugin()],
};

// Custom: handle multiple file types
export default {
  plugins: [
    rawImportsPlugin({
      extensions: ['.md', '.txt', '.json'],
    }),
  ],
};
```

## When to Use This Plugin

While Vite has built-in `?raw` support, this plugin is recommended when:

- Building libraries with `build.lib` mode (Vite's native support may be inconsistent)
- Using complex relative paths like `../../README.md?raw`
- Needing guaranteed consistent behavior across all build modes
- Working with files outside the standard `src` directory structure

For simple app builds with standard file locations, Vite's built-in `?raw` support may be sufficient.

## Limitations

- Only works with text-based files (binary files will be corrupted)
- File content is loaded at build time, not runtime
- Large files may impact build performance

## Related Packages

- `@equinor/fusion-imports` - Similar functionality for esbuild-based imports
- `@equinor/fusion-framework-cli` - CLI tool that includes this plugin by default

