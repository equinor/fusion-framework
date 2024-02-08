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

```sh
npm i -D '@equinor/fusion-framework-cli'
```

## Config (optional)



```ts
// app.config.ts
import { mergeAppConfigs, defineAppConfig } from '@equinor/fusion-framework-cli';
export default defineAppConfig((_env, { base }) =>
    mergeAppConfigs(base, {
        environment: {
            endpoints: {
              api: {
                baseUri: 'https://foo.bar',
                defaultScopes: ['default']
              }
            }
        },
    }),
);

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
// app.manifest.config.ts
import { defineAppManifest, mergeManifests } from '@equinor/fusion-framework-cli';

export default defineAppManifest((env, { base }) => {
  return mergeManifests(
    base,
    {
      /** override name from package.json */
        "appKey": "my-key",
    }
  )
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

[read more about CLI](../../cli/docs/app.md)
