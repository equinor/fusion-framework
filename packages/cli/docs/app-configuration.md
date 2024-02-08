---
title: Fusion Framework CLI - App Configuration
---

## Config

<!-- TODO: add link to documentation about Fusion application configuration and services -->

> this is the configuration served to the application from the application service

the cli will look for a `app.config.{ts,js,json}` which will be provided to the configuration step of the application

```ts
export type AppConfig = {
    /** application config */
    environment?: Record<string, unknown>;
};
```

[see how to generate config](./app.md#config)


## Manifest

<!-- TODO: add link to documentation about Fusion application manifest, models and services -->

the cli will look for a `app.manifest.config.{ts,js,json}` which will be provided to the configuration step as manifest

> [!NOTE]
> by default the the application will generate a manifest based on the package.json

[see how to generate config](./app.md#manifest)

#### Resources

<!-- TODO: add migration tip -->

When uploading resources used within the application, the need to be defined in the manifest.

> [!NOTE]
> A new application service is under construction, which supports dynamic resources. 
> Since resources will be deprecated in the future, so the CLI will not auto generate it from the `package.json` attribute

__app.manifest.config.ts__
```ts
import { defineAppManifest } from '@equinor/fusion-framework-cli';
export default defineAppManifest((env, { base }) => {
  return {
    ...base,
    resources: [
        'static/foo.png',
        'static/bar.svg',
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


> [!IMPORTANT]
> Resources will be removed in future version of Fusion, the will come an migration guide of how to include static content

## Vite

the cli will look for a `app.vite.config.{ts,js,json}` [Vite Configuration](https://vitejs.dev/config/)

> [!IMPORTANT]
> in most cases developers do not need to alter the base vite configuration, __this is only a option as a last resort__.

> [!CAUTION]
> adding a `vite.config` to the base of your project will override Fusion Framework CLI base config, __NOT RECOMMENDED__

