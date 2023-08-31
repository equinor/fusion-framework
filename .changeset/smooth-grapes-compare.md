---
'@equinor/fusion-framework-cli': major
---

Rewrite fusion framework CLI

Rework of the Fusion Framework CLI to support future features

> the CLI was thrown together as a proof of concept, but grown un-manageable, because of lack of structure

**Main Features**

- Separate logic and utilities from program (app/cli commands)
- allow user to provide config files `app.{config,manifest,vite}.{ts,js,json}`
  - the cli will try to resolve from `.ts` then `.js` then `.json`
  - `app.config` is used to configure application environment configs (app-service config)
  - `app.manifest` application manifest, information about the application
  - `app.vite` override the CLI vite configuration
- provide interface for `app.TYPE.ts` config
  - `define` and `merge` functionality
  - note that `app.config` and `app.manifest` needs to return full object _(will not be merged by CLI)_
- allow providing config file in command
- using config when resolving proxy request
- improved CLI logging

**examples**

app.config.ts 
```ts
import { mergeAppConfigs, defineAppConfig } from '@equinor/fusion-framework-cli';
export default defineAppConfig((_nev, { base }) =>
    mergeAppConfigs(base, {
        environment: {
            api: {
              foo: {
                baseUri: 'https://foo.bars',
                scopes: ['foobar'],
              }
            }
        },
    }),
);
```

app.manifest
```ts
import { defineAppManifest, mergeManifests } from '@equinor/fusion-framework-cli';

export default defineAppManifest((env, { base }) => {
    if (env.command === 'serve') {
        return mergeManifests(base, {
            key: 'simple',
        });
    }
    return base;
});
```

fusion-framework-cli app
```sh
fusion-framework-cli app dev --manifest app.manifest.local.ts
```


