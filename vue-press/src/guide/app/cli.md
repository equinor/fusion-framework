---
title: Framework CLI
category: Guide
tags:
  - how to
  - basic
  - app
  - cli
---

![CLI](./cli.png)

<ModuleBadge module="cli" />

```sh
yarn add --dev '@equinor/fusion-framework-cli'
```

## Config

> Currently these configuration are only for local development.

```js
// app.config.js
export default () => ({
  /** override name from package.json */
  "appKey": "my-key",

  /** custom properties */
  "environment": {
    "foo": "bar"
  },

  /** custom endpoints */
  "endpoints": {
    "api": "https://foo.barz"
  }
});
```

> WIP: config for local dev server
```js
// dev-server.config.js
export default () => ({
  /** feature coming soon */
});
```

### Vite

by default the CLI will generate configuration required, but can be overridden by providing custom [Vite config](https://vitejs.dev/config/).

```sh
fusion-framework-cli app dev -c vite.config.js
fusion-framework-cli app build -c vite.config.js
fusion-framework-cli app build --config vite.config.js
```

__example__
```js
/** @type {import('vite').UserConfig} */
export default {
  build: {
    minify: false,
    terserOptions: {
      mangle: false
    },
    sourcemap: true
  }
}
```

> only static `UserConfig` is allowed

## Dev

Run the application locally

```sh
fusion-framework-cli app dev
```

## Build

Building the application for `production` mode

```sh
fusion-framework-cli app build
```

> in the future the will come an option for building an standalone application (`ci` testing app)