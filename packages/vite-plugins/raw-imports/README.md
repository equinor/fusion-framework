# @equinor/fusion-framework-vite-plugin-raw-imports

Vite plugin that embeds text files as inline string modules via `?raw` imports.

Use this plugin when you need reliable raw-string imports in **Vite library mode** (`build.lib`) or when Vite's built-in `?raw` handler mishandles deeply nested relative paths. It is included automatically by `@equinor/fusion-framework-cli`.

> [!NOTE]
> Vite supports `?raw` imports natively, but treats them as static assets.
> This plugin reads the file at build time and inlines the content directly
> into the JavaScript bundle, so the string is available at runtime without
> a separate asset request.

## Who Should Use This

- **Fusion app developers** — the plugin is already active when you build with `@equinor/fusion-framework-cli`. No setup needed.
- **Library authors** building with `vite build --lib` who import markdown, text, or template files as strings.
- **Anyone** hitting 404s or incorrect paths from Vite's native `?raw` with deeply nested relative imports.

## Quick Start

### Automatic (Fusion CLI)

If you build with `@equinor/fusion-framework-cli`, the plugin is registered for you. Just import:

```typescript
import readme from '../../README.md?raw';
console.log(readme); // full file content as a string
```

### Manual Installation

```bash
pnpm add -D @equinor/fusion-framework-vite-plugin-raw-imports
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { rawImportsPlugin } from '@equinor/fusion-framework-vite-plugin-raw-imports';

export default defineConfig({
  plugins: [rawImportsPlugin()],
});
```

## Key Concepts

### Build-Time Embedding

The plugin runs during Vite's build (and dev-server) transform pipeline. When it encounters an import like `'./notes.md?raw'`, it:

1. Resolves the file path relative to the importing module.
2. Reads the file content from disk.
3. Returns a virtual module: `export default "<file content>"`.

The result is a regular JavaScript string — no asset request at runtime.

### Extension Filtering

By default only `.md` files are intercepted. All other `?raw` imports (images, shaders, etc.) fall through to Vite's built-in handler, so existing imports keep working.

### Enforcement Phase

The plugin registers with `enforce: 'pre'`, meaning it resolves imports **before** Vite's internal asset plugin. This avoids conflicts in library mode.

## Common Patterns

### Display Markdown in a React Component

```tsx
import readmeContent from '../../README.md?raw';
import '@equinor/fusion-wc-markdown/markdown-viewer';

export default function AboutPage() {
  return <fwc-markdown-viewer>{readmeContent}</fwc-markdown-viewer>;
}
```

### Handle Additional File Extensions

```typescript
import { rawImportsPlugin } from '@equinor/fusion-framework-vite-plugin-raw-imports';

export default defineConfig({
  plugins: [
    rawImportsPlugin({
      extensions: ['.md', '.txt', '.json'],
    }),
  ],
});
```

> [!NOTE]
> Extensions not listed in the `extensions` option are handled by Vite's
> built-in `?raw` support, so image and shader imports remain unaffected.

### Add TypeScript Declarations for Raw Imports

Create a declaration file so TypeScript recognises `?raw` imports:

```typescript
// src/types/raw.d.ts
declare module '*.md?raw' {
  const content: string;
  export default content;
}
```

### Resolve Various Path Formats

```typescript
import a from './file.md?raw';            // same directory
import b from '../README.md?raw';         // parent directory
import c from '../../docs/guide.md?raw';  // deeply nested relative
import d from '/src/docs/guide.md?raw';   // absolute from project root
```

Paths are resolved relative to the importing file's directory.

## API Surface

| Export | Type | Description |
|---|---|---|
| `rawImportsPlugin` | `(options?: RawImportsPluginOptions) => Plugin` | Factory that creates the Vite plugin instance. |
| `default` | Same as `rawImportsPlugin` | Default export for convenient one-liner usage. |
| `RawImportsPluginOptions` | `interface` | Configuration object accepted by the factory. |

### `rawImportsPlugin(options?)`

Create a Vite plugin that intercepts `?raw` imports for configured file extensions and returns their content as inline string modules.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `options` | `RawImportsPluginOptions` | `undefined` | Optional configuration object. |
| `options.extensions` | `string[]` | `['.md']` | File extensions to intercept. Each entry must include the leading dot. |

**Returns:** `Plugin` — a Vite plugin with `resolveId` and `load` hooks.

**Throws:** `Error` when a matched file cannot be read from disk. The error message includes the resolved path and the underlying OS error:

```
Failed to read file: /absolute/path/to/file.md. ENOENT: no such file or directory
```

## When to Use This Plugin vs Vite's Built-In `?raw`

| Scenario | Recommendation |
|---|---|
| Standard app build, files inside `src/` | Vite's built-in `?raw` is usually sufficient. |
| Library build with `build.lib` | Use this plugin — Vite's native handler can be inconsistent. |
| Deeply nested relative paths (`../../`) | Use this plugin — it resolves relative paths more reliably. |
| Binary files (images, fonts) | Do **not** use this plugin — it reads as UTF-8 text only. |

## Constraints and Limitations

- **Text files only** — binary content will be corrupted because the plugin reads with `utf-8` encoding.
- **Build-time only** — file content is captured at build time; runtime file changes are not reflected.
- **Bundle size** — large files are embedded verbatim in the JavaScript bundle, which affects bundle size.

## Related Packages

- `@equinor/fusion-framework-cli` — CLI that includes this plugin by default for all Vite builds.
- `@equinor/fusion-imports` — similar raw-import functionality for esbuild-based builds.

