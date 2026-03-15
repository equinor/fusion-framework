# @equinor/fusion-imports

Utilities for importing and transpiling TypeScript, JavaScript, and JSON configuration files at **Node.js runtime** using [esbuild](https://esbuild.github.io/).

> [!IMPORTANT]
> This package works with **file paths**, not URLs. It is designed for loading configuration scripts at runtime in Node.js CLI tools and build pipelines.

## Installation

```bash
pnpm add @equinor/fusion-imports
```

## When to use

| Scenario | Function |
|---|---|
| Load a config by basename, auto-resolving `.ts` → `.js` → `.json` | `importConfig` |
| Bundle & import a single TypeScript/JS module at runtime | `importScript` |
| Read and parse a JSON file from disk | `importJSON` |
| Find the first accessible config file for a basename | `resolveConfigFile` |

## Quick start

```typescript
import { importConfig } from '@equinor/fusion-imports';

interface AppSettings {
  name: string;
  port: number;
}

// Resolves app.config.ts → app.config.js → app.config.json
const { config, path } = await importConfig<AppSettings>('app.config');
console.log(`Loaded ${path}:`, config);
```

## API

### `importConfig<C>(basename, options?)`

Resolves a configuration file by basename, probing extensions in order (`.ts`, `.mjs`, `.js`, `.json`). JSON files are parsed directly; script files are bundled with esbuild and dynamically imported.

```typescript
import { importConfig } from '@equinor/fusion-imports';

interface MyConfig {
  name: string;
  bar: { foobar: number };
}

interface ScriptModule {
  generateConfig: (options: { env: string }) => MyConfig;
}

const { config } = await importConfig<MyConfig, ScriptModule>('my-config', {
  script: {
    resolve: (module) => module.generateConfig({ env: 'production' }),
  },
});
```

By default the module's `default` export is used as the config value. Provide `script.resolve` to extract a different export or call a factory function.

#### Options

| Option | Type | Description |
|---|---|---|
| `baseDir` | `string` | Base directory for file resolution (default: `process.cwd()`) |
| `extensions` | `string[]` | Extensions to probe (default: `['.ts', '.mjs', '.js', '.json']`) |
| `script.resolve` | `(module) => C` | Extracts the config value from the imported module |
| `script.esBuildOptions` | `ImportScriptOptions` | Esbuild overrides forwarded to `importScript` |

### `importScript<M>(entryPoint, options?)`

Bundles a TypeScript or JavaScript file with esbuild (ESM, external packages) and dynamically imports the output. Two built-in esbuild plugins are included automatically:

- **`importMetaResolvePlugin`** — resolves `import.meta.resolve()` calls for relative paths at build time.
- **`rawMarkdownPlugin`** — supports `?raw` imports for `.md` / `.mdx` files.

```typescript
import { importScript } from '@equinor/fusion-imports';

interface Greeting { greet(name: string): string }
const mod = await importScript<Greeting>('./greet.ts');
console.log(mod.greet('World'));
```

#### Esbuild customisation

`ImportScriptOptions` inherits all `esbuild.BuildOptions` except `entryPoints`, `bundle`, and `format`. You can pass custom plugins, define aliases, or change the output directory:

```typescript
import { importScript } from '@equinor/fusion-imports';
import alias from 'esbuild-plugin-alias';

const mod = await importScript('./entry.ts', {
  plugins: [alias({ '@app': './src' })],
  outfile: '/tmp/bundle.js',
});
```

### `importJSON<T>(filePath, encoding?)`

Reads a JSON file from disk and returns the parsed content. Throws with the original error as `cause` if the file is unreadable or contains invalid JSON.

```typescript
import { importJSON } from '@equinor/fusion-imports';

interface Manifest { name: string; version: string }
const manifest = await importJSON<Manifest>('./package.json');
```

### `resolveConfigFile(baseName, options?)`

Returns the absolute path of the first accessible configuration file matching the given basename and extension list. Useful when you need the path without importing the file.

```typescript
import { resolveConfigFile } from '@equinor/fusion-imports';

const configPath = await resolveConfigFile('app.config', {
  baseDir: '/project',
  extensions: ['.ts', '.json'],
});
```

### Plugins

#### `rawMarkdownPlugin(options?)`

Esbuild plugin that intercepts `?raw` imports for markdown files and returns
their content as a default-exported string. Included automatically by `importScript`.

```typescript
// In a file bundled by importScript:
import readme from '../../README.md?raw';
console.log(readme); // raw markdown string
```

#### `createImportMetaResolvePlugin()`

Esbuild plugin that replaces `import.meta.resolve('./relative')` calls with
resolved `file://` URLs at build time. Included automatically by `importScript`.

### Error handling

The package provides two error classes for filesystem failures:

| Error | Thrown when |
|---|---|
| `FileNotFoundError` | File does not exist (`ENOENT`) |
| `FileNotAccessibleError` | File exists but cannot be read (`EACCES`, `EISDIR`) |

Both extend `Error` and attach the original Node.js error as `cause`:

```typescript
import { importConfig, FileNotFoundError } from '@equinor/fusion-imports';

try {
  await importConfig('missing');
} catch (error) {
  if (error instanceof FileNotFoundError) {
    console.error('Config not found:', error.message);
  }
}
```