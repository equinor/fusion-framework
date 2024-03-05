
## Concept

Module for loading applications _(primary for initiators of the framework, ex a portal)_

The enabler will optionally configure the client for fetching manifests, configuration and load application entrypoint (script)

### Limitations

By design this module only allows having one active application as current

> [!TIP]
> By enabling `Widgets` _(almost the same as app)_, multiple instances can be initiated

## Usage

```ts
import { enableAppModule } from '@equinor/fusion-framework-module-app';

export const configure = async (config: FrameworkConfigurator) => {
    enableAppModule(config);
};
```