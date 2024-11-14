---
title: Fusion Framework CLI - App Configuration
---

## Config

<!-- TODO: add link to documentation about Fusion application configuration and services -->

> this is the configuration served to the application from the application service

the cli will look for a `app.config.{ts,js,json}` which will be provided to the configuration step of the application

## Config (optional)

```ts
// app.config.ts
import { defineAppConfig } from '@equinor/fusion-framework-cli';
export default defineAppConfig() => {
    return {
        environment: {
          fish: 'they can fly?',
          shrimp: {
            type: 'crustation',
            desc: 'cockroach of the sea'
          }
        },
        endpoints: {
          api: {
            url: 'https://foo.bar',
            scopes: ['default'],
          },
        },
    },
});
```

You can configure framework services in the `src/config.ts` file.

> this is the configuration used by the application to configure framework services and modules

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

You can override defaults with mergeManifests

```ts
// app.manifest.config.ts should be of type AppManifestExport
import { defineAppManifest, mergeManifests } from '@equinor/fusion-framework-cli';

export default defineAppManifest((env, { base }) => {
  return mergeManifests(
    base,
    {
      entryPoint: 'index.js'
    }
  )
});
```

#### Resources

<!-- TODO: add migration tip -->

If the archive contains a file that isn't whitelisted by default it's possible to allow it by adding it's extension to the allowedExtensions array.

**Default allowed extensions**:

- .md
- .js
- .json
- .map

> [!IMPORTANT]
> Resources are now deprecated, so the CLI will no longer auto generate it from the `package.json` attribute

##### app.manifest.config.ts

```ts
import { defineAppManifest } from '@equinor/fusion-framework-cli';
export default defineAppManifest((env, { base }) => {
  return {
    ...base,
    allowedExtensions: [
        '.png',
        '.svg',
    ],
  };
});
```

By default [Vite](https://vitejs.dev/config/shared-options.html#publicdir) will copy the `public` folder, simply move the resources to the public folder

for more advance, override the application vite config in `app.vite.config.ts`

```ts
/** @type {import('vite').UserConfig} */
export default {
  publicDir: 'resources'
}
```

## Vite

the cli will look for a `app.vite.config.{ts,js,json}` [Vite Configuration](https://vitejs.dev/config/)

> [!IMPORTANT]
> in most cases developers do not need to alter the base vite configuration, **this is only a option as a last resort**.

vite.config

> [!CAUTION]
> adding a `vite.config` to the base of your project will override Fusion Framework CLI base config, **NOT RECOMMENDED**
