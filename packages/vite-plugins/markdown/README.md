# @equinor/fusion-framework-vite-plugin-markdown

Vite plugin for handling markdown file imports with `?raw` query parameter.

## Installation

```bash
pnpm add -D @equinor/fusion-framework-vite-plugin-markdown
```

## Usage

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { markdownPlugin } from '@equinor/fusion-framework-vite-plugin-markdown';

export default defineConfig({
  plugins: [
    markdownPlugin(),
  ],
});
```

## Features

- Handles imports like `import content from './README.md?raw'`
- Exports the raw markdown content as a string
- Compatible with Vite's built-in `?raw` import behavior
- Includes markdown files as assets by default

## Options

```typescript
markdownPlugin({
  assetsInclude: true, // Whether to include markdown files as assets (default: true)
})
```

## Example

```typescript
// In your component
import readmeContent from './README.md?raw';

export default function Component() {
  return <div>{readmeContent}</div>;
}
```

