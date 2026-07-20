# @equinor/fusion-framework-vite-plugin-routes-dsl

Vite plugin for transforming `import.meta.resolve()` calls in route DSL files to resolved file:// URLs at build time.

## Installation

```bash
pnpm add -D @equinor/fusion-framework-vite-plugin-routes-dsl
```

## Usage

Add the plugin to your `vite.config.ts`:

```typescript
import { routesDslPlugin } from '@equinor/fusion-framework-vite-plugin-routes-dsl';

export default {
  plugins: [
    routesDslPlugin()
  ]
};
```

## What it does

This plugin transforms `import.meta.resolve()` calls in your route DSL files to resolved file:// URLs during the build process. This is necessary because Vite doesn't handle `import.meta.resolve()` calls during bundling for route definitions.

### Example

**Before transformation:**
```typescript
import { layout } from '@equinor/fusion-framework-react-router/routes';

export const routes = layout(import.meta.resolve('./Layout.tsx'), pages);
```

**After transformation:**
```typescript
import { layout } from '@equinor/fusion-framework-react-router/routes';

export const routes = layout('file:///absolute/path/to/Layout.tsx', pages);
```

## Options

```typescript
interface RoutesDslPluginOptions {
  /**
   * Whether to transform import.meta.resolve() calls to file:// URLs.
   * @default true
   */
  transformResolve?: boolean;
}
```

## When to use

Use this plugin when:
- You're using the Fusion Framework React Router DSL with `import.meta.resolve()` calls
- You need route file paths to be resolved at build time
- You're experiencing issues with route resolution in production builds

## How it works

The plugin:
1. Scans all files during Vite's transform phase
2. Finds `import.meta.resolve()` calls with relative paths (starting with `./` or `../`)
3. Resolves the paths relative to the file's directory
4. Transforms them to `file://` URLs
5. Leaves package imports unchanged

