# @equinor/fusion-framework-vite-plugin-react-router

Vite plugin for compiling the file-route DSL from
`@equinor/fusion-framework-react-router` into standard React Router data routes.

The package contains only the build-time transformer. Generated application code
continues to import runtime APIs from `@equinor/fusion-framework-react-router`.

## Installation

```bash
pnpm add -D @equinor/fusion-framework-vite-plugin-react-router
```

Install `@equinor/fusion-framework-react-router` separately as an application
runtime dependency.

## Usage

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { reactRouterPlugin } from '@equinor/fusion-framework-vite-plugin-react-router';

export default defineConfig({
  plugins: [react(), reactRouterPlugin()],
});
```

The plugin finds route DSL calls such as `layout`, `index`, `route`, and
`prefix`, inspects the referenced route modules for supported exports, and
generates the corresponding route objects and static imports.

Route-module exports are inspected with Rolldown/Oxc, aligning with Vite 8.
TypeScript/JSX is transformed locally without executing pages, loading tsconfig
files or following imports. Local export aliases and quoted-source re-exports use
their public names; comments, strings and type-only exports are ignored.
An existing route module that cannot be read or parsed fails the build explicitly
rather than silently dropping middleware or other handlers.

Rolldown is pinned to the tested version because its transform utility API is
currently marked experimental upstream.

## Options

Set `debug: true` to log files transformed by the plugin:

```ts
reactRouterPlugin({ debug: true });
```

For compatibility, the plugin is also re-exported from
`@equinor/fusion-framework-react-router/vite-plugin`.
