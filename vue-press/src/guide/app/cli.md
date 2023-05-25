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