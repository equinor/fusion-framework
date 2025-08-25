---
title: "@equinor/fusion-framework-app"
description: "Application foundation package for the Fusion Framework"
category: "Application"
tag:
  - app
  - core
  - foundation
  - modules
  - framework
  - typescript
---

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fapp%2Fpackage.json&label=@equinor/fusion-framework-app&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/app)

## Overview

The `@equinor/fusion-framework-app` package serves as the foundation for building Fusion applications. It provides a streamlined way to initialize and configure essential modules that most applications need, while keeping the setup lightweight and flexible.

This package acts as a curated collection of core modules with sensible defaults, allowing developers to quickly bootstrap applications without having to manually wire up common functionality like authentication, HTTP communication, and event handling.

### Key Features

- **Pre-configured Core Modules**: Essential modules like authentication (MSAL), HTTP client, and event handling are included and configured by default
- **Optional Module System**: Advanced features like state management and bookmarks can be easily enabled when needed
- **Lightweight Design**: Only includes essential dependencies, with optional modules available as peer dependencies
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Framework Agnostic**: Works with any JavaScript framework, with specialized React integrations available

### When to Use

Use this package when building:
- Fusion Applications
- Standalone applications that need Fusion Framework capabilities
- Applications requiring authentication, API communication, and event handling

## 📚 Documentation

For comprehensive guides, examples, and API documentation, visit the [Fusion Framework Documentation](https://equinor.github.io/fusion-framework/).

## Modules

The `@equinor/fusion-framework-app` package provides a set of modules that can be used to enhance the functionality of your application. These modules are designed to be used in conjunction with the Fusion Framework and provide a way to integrate various features into your application.

In conjunction, this package offers some module enabler methods for easy integration and configuration of these modules.

### Enabled by default

#### HTTP Module
[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fmodules%2Fhttp%2Fpackage.json&label=@equinor/fusion-framework-module-http&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/modules/http)

_The HTTP module provides a way to make HTTP requests and handle responses within the application._

> [!TIP]
> If the service is registered in [Service Discovery](#service-discovery) module, you can use the service name to resolve the API endpoint.

```typescript
import type { AppModuleInitiator } from '@equinor/fusion-framework-app';

const configure: AppModuleInitiator = (configurator) => {
    configurator.configureHttp((builder) => {
        builder.configureHttpClient(
            'my-api-client',
            {
                baseUri: '/api', 
                defaultScopes: ['api://default'] 
            }
        );
    });
};
```

#### Auth Module
[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fmodules%2Fmsal%2Fpackage.json&label=@equinor/fusion-framework-module-msal&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/modules/msal)

_The MSAL module provides a way to integrate Microsoft Authentication Library (MSAL) into the application._


#### Service Discovery

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fmodules%2Fservice-discovery%2Fpackage.json&label=@equinor/fusion-framework-module-service-discovery&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/modules/service-discovery)

_The service discovery module provides a way to resolve API endpoints and interact with microservices within the application._

> [!NOTE]
> To resolve a service, it need to be configured which service(s) to use in the application.

```typescript
import type { AppModuleInitiator } from '@equinor/fusion-framework-app';

const configure: AppModuleInitiator = (configurator) => {
    configurator.useFrameworkServiceClient('my-registered-service', { /** options */});
};

// example usage after application module initialization
const client = appModules.http.createHttpClient('my-api-client');
```


#### Event Module
[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fmodules%2Fevent%2Fpackage.json&label=@equinor/fusion-framework-module-event&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/modules/event)

_The event module provides a way to manage and handle events within the application._

### User Enabled

`@equinor/fusion-framework-app` exposes modules for application enablement, since some modules might require application-specific configurations.

> [!NOTE]
> `@equinor/fusion-framework-app` only has these modules as optional dependencies, which means the module need to be installed in the application project to work.
>
> _We chosen not to include the optional modules to keep the core package lightweight and focused on essential functionality._

> [!WARNING]
> Event though an application may enable modules directly, it is important to ensure that the necessary configurations are in place for each module to function as intended.

#### State Management

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fmodules%2Fstate%2Fpackage.json&label=@equinor/fusion-framework-module-state&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/modules/state)

_The state management module provides a way to manage the state of the application. This is useful for keeping track of user preferences, application settings, and other data that needs to persist across sessions._

```sh
# Install the state management module
pnpm add @equinor/fusion-framework-module-state
```

```typescript
import type { AppModuleInitiator } from '@equinor/fusion-framework-app';
import { enableState } from '@equinor/fusion-framework-app/state';

const configure: AppModuleInitiator = (configurator) => {
    enableState(configurator);
};
```

#### Bookmarks

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fmodules%2Fbookmark%2Fpackage.json&label=@equinor/fusion-framework-module-bookmark&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/modules/bookmark)

_The bookmark module provides a way to save and restore the state of the application. This is useful for saving the state of the application when the user navigates away from the application and then returns to the application._

```sh
# Install the bookmark module
pnpm add @equinor/fusion-framework-module-bookmark
```

```ts
import type { AppModuleInitiator } from '@equinor/fusion-framework-app';
import { enableBookmark } from '@equinor/fusion-framework-app/bookmark';

const configure: AppModuleInitiator = (configurator) => {
    enableBookmark(configurator);
};
```

## Advance

### Extending the Application Configuration

In some case one might want to extend the application configuration to include pre-defined modules and custom behavior,
like maintaining a suite of applications that requires a common set of modules.

> [!NOTE]
> At the moment the utility functions for initializing application modules does not support defining custom application configurations,
> which means that scaffolding needs to be re-implemented.

```ts
import { AppConfigurator, AppEnv } from '@equinor/fusion-framework-app';

type CustomAppManifest = { /** custom attributes */ }
type MyFrameworkModuleInstance = { /** custom module selection */ }

type CustomAppEnv = AppEnv & {
    manifest: CustomAppManifest;
    /** other custom environment properties */
};

// extending the Fusion AppConfigurator
class ExtendedAppConfigurator<
    TModules extends Array<AnyModule> | unknown = unknown,
    TRef extends MyFrameworkModuleInstance = MyFrameworkModuleInstance,
    TEnv extends CustomAppEnv = CustomAppEnv,
  >
  extends AppConfigurator<TModules, TRef, TEnv> {
    constructor(env: TEnv) {
        super(env);
        this._modules.push(MyCustomModule);
   }
}
```

### Application Configuration with custom framework

`AppConfigurator` in `@equinor/fusion-framework-app` is a superset of  `ModulesConfigurator` in `@equinor/fusion-framework-module`, 
which means that creating a custom application configuration outside the __Fusion Framework__ is most likely better of with starting from scratch with `ModulesConfigurator`.