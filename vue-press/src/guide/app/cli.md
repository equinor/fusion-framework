---
title: Framework CLI
category: Guide
tag:
  - how to
  - basic
  - app
  - cli
---

![CLI](./cli.png)

## Installation

```sh
npm i -D '@equinor/fusion-framework-cli'
```

## Config (optional)

```ts
// app.config.ts
import { defineAppConfig } from '@equinor/fusion-framework-cli';
export default defineAppConfig() => (
    {
        environment: {
            scope: 'default',
        },
        endpoints: {
            api: {
                url: 'https://api.example.com',
            },
        },
    }
);
```

```ts
// src/config.ts
import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
export const configure: AppModuleInitiator = (configurator, { env }) => {
    const { endpoints } = env.config.environment;
    configurator.configureClient( 'api', endpoints.api );
};
```

### Manifest (optional)

By default the CLI will create a manifest on best effort from `package.json`

```ts
// app.manifest.config.ts should be of type AppManifestExport
import { defineAppManifest } from '@equinor/fusion-framework-cli';

export default defineAppManifest(() => ({
  build: {
    entryPoint: 'index.js',
  },
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

> To create zipped standalone app bundle see the ``app pack``command below

## App bundle

Create zipped standalone app bundle to upload to your portal.

```sh
fusion-framework-cli app pack
```

> its important to set your package type to module to generate a proper app-bundle for use in the Fusion portal, add `"type": "module"` to your package.json.

[read more about CLI](../../cli/index.md)
