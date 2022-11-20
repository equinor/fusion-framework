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

```js
// dev-server.config.js
export default () => ({
  /** feature coming soon */
});
```


## Dev

```sh
fusion-framework-cli app dev
```

## Build
```sh
fusion-framework-cli app build
```