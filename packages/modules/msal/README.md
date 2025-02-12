## MSAL mod

This modules provides configuration and utilities for working with the Microsoft Authentication Library (MSAL) in Fusion.

## Configuration

> [!IMPORTANT]
> The `@equinor/fusion-framework-app` enables this package by default, so applications using the app package do not need to enable this package.

```ts
// enable the module
import { enableMsal } from '@equinor/fusion-framework-module-msal';

export const configure = (configurator: IModulesConfigurator) => {
  enableMsal(configurator);
};
```

> [!WARNING] 
> Only the first ancestor should configure the module. All sub scopes will inherit the configuration from the first ancestor.
```ts

import { enableMsal } from '@equinor/fusion-framework-module-msal';

const myConfigurator = new ModulesConfigurator();

const msalConfig: AuthConfig = {
  tenantId: 'your-tenant',
  clientId: 'your-client'
  callbackUrl: 'your-callback-url'
};

// Enable MSAL
enableMsal(myConfigurator, (msalConfigurator) => msalConfigurator.setClientConfig(msalConfig));

// Alternatively
import { configureMsal } from '@equinor/fusion-framework-module-msal';
myConfigurator.addConfig(configureMsal(msalConfigurator => {
  configurator.setClientConfig(msalConfig);
}));

// Native MSAL configuration
import { module } from '@azure/msal-browser';
myConfigurator.addConfig({
  module: module,
  config: (msalConfigurator) => msalConfigurator.setClientConfig(msalConfig)
}
```

### Interoperability with MSAL versions

The provider proxy generation is by default set to `MsalModuleVersion.Latest`, which will be resolved by the ancestor module. If you want to force a specific version, you can set the version in the configuration.

> [!NOTE]
> this should not be necessary in most cases and only done by understanding the inner workings of the module, but can be done in a transition phase._

```ts
import { MsalModuleVersion } from '@equinor/fusion-framework-module-msal';
enableMsal(myConfigurator, (msalConfigurator) => {
  msalConfigurator.setClientConfig(msalConfig);
  msalConfigurator.setVersion(MsalModuleVersion.V2);
});
```

## Major versions

**V4**

The module change to use module hoisting, which means that sub modules instances will proxy the parent module instance. This means that the module instance will be shared between all instances of the module. 

This is a __breaking change__ since this module used to support multiple MSAL clients _(multi tenant, multi authority)_ in the same scoped instance. This is no longer supported, due to the way `@azure/msal-browser` uses a shared cache.

This version still uses `@azure/msal-browser@^2`, but enables 

