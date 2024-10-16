---
title: Getting started
category: Guide
tag:
  - how to
  - basic
  - app
---

## Requirement

- [React 17+](https://reactjs.org/)

## Setup

### CLI

<ModuleBadge module="cli" />

```sh
npm i -D '@equinor/fusion-framework-cli'
```

### Frameowork

<ModuleBadge module="react/app" />

```sh
npm i -D '@equinor/fusion-framework-react-app'
```

### Typescript

::: code-tabs
@tab tsconfig.json
```json
{
  "compilerOptions": {
    "rootDir": "src",
    "jsx": "react-jsx",
    "module": "ES2022",
    "target": "ES6",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "lib": [
      "esnext",
      "dom",
      "dom.iterable"
    ],
  }
}
``` 
:::

### EsLint
::: code-tabs

@tab .eslintrc
```json 
{
  "extends": "@equinor/eslint-config-fusion-react",
}
```

@tab required packages
```sh
npm i -D @equinor/eslint-config-fusion eslint prettier
```

:::


## Configuration

[📚 Read more about configuration of modules](../../modules/README.md)

```ts
/** config.ts */
import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
export const configure: AppModuleInitiator = async (configurator, { fusion, env }) => {
  ...
};
```

### Application Config

When the application renders, the portal will load configuration from `app service`

::: code-tabs

@tab src/config.ts

```ts
import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';

import { enableContext } from '@equinor/fusion-framework-module-context';

export const configure: AppModuleInitiator = (configurator) => {
  // enable context and set contextType
    enableContext(configurator, async (builder) => {
        builder.setContextType(['projectMaster']); 
    });

    // configure framework loglevel
    configurator.logger.level = 0;
};

export default configure;
```

@tab app.config.ts

```ts
import { defineAppConfig } from '@equinor/fusion-framework-cli';
export default defineAppConfig((_nev, { base }) =>
    return {
        environment: {
           foo: 'foobar',
        },
        endpoints: {
            api: {
                url: 'https://foo.bars',
                scopes: ['myscope/.default']
            },
        },
    },
);

```

:::

#### Environment variables

To access the environment variables in the application, use the hook `useAppEnvironmentVariables` from `@equinor/fusion-framework-react-app`.

```ts
import { useAppEnvironmentVariables } from '@equinor/fusion-framework-react-app';

type AppEnvironmentVariables = {
  API_URL: string;
  API_SCOPE: string;
}

const MyComponent = () => {
  const env = useAppEnvironmentVariables<AppEnvironmentVariables>();
  console.log(env); // { API_URL: 'https://foo.bar', API_SCOPE: 'c5161f15-9930-4cfc-b233-e9dfc5f8ad82/.default' }
}
```

> [!INFO]
> The `useAppEnvironmentVariables` hook consumes asyncronous data from the app service.
> In theory the value should always be available, since loaded during configuration.
>
> There will be a future module which manages application state, where during the configuration the 
> desired environment variables can be picked.

## Creating Application

### Main
@[code](@cookbooks/app-react/src/index.ts)


### Config
@[code](@cookbooks/app-react/src/config.ts)

### Component
@[code](@cookbooks/app-react/src/App.tsx)


## Basic features

### Use http client

upload this config to the application admin under `configs`
> in the future the `config.endpoint` attribute in app admin will support scopes

[read more about authentication](./authentication.md)

```json
// config.ENV.json
{
  "services": {
    "myApi": {
      "baseUri": "https://foo.bar",
      "defaultScopes": "c5161f15-9930-4cfc-b233-e9dfc5f8ad82/.default"
    }
  }
}
```

configure application to create a http client based on dynamic config from app service
```ts
// config.ts
export const configure: AppModuleInitiator = (configurator, { env }) => {
  const endpointApi = env.config?.getEndpoint('myApi');
  configurator.configureHttpClient('myApi', {
      baseUri: endpointApi?.url,
      defaultScopes: endpointApi?.scopes,
  });
  // ... other config setting
```

create a util hook for accessing custom http client
```ts
// useMyApi.ts
import { useModule } from '@equinor/fusion-framework-react-app';
import { useHttpClient } from '@equinor/fusion-framework-react-app/http';
import type { IHttpClient } from '@equinor/fusion-framework-react-app/http';

export const useFooClient = (): IHttpClient => {
  const httpProvider = useModule('http');
  return useHttpClient('useMyApi');
}
```

### Use service discovery

enable usage of service clients from service discovery

[see available services](../../modules/service-discovery/)

[see http module](../../modules/http/)

```ts
export const configure = (configurator) => {
  /** enable usage of fusion portal api service  */
  await configurator.useFrameworkServiceClient('portal');
}
```

### Enable routing
Enable routing in application

[read more about navigation](../../modules/navigation/README.md)

```ts
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
export const configure = (configurator, { env: { basename } }) => {
  enableNavigation(configurator, basename);
}
```

### Enable context

[read more about context](../../modules/context/README.md)

::: code-tabs
@tab simple
```ts
import { enableNavigation } from '@equinor/fusion-framework-module-context';
export const configure = (configurator) => enableContext(configurator);
```

@tab advance
```ts
import { enableNavigation } from '@equinor/fusion-framework-module-context';
export const configure = (configurator) => {
   enableContext(configurator, (builder) => {
        builder.setContextType(['project']);
        builder.setContextFilter((items) => {
            return items.filter(item => item.title.match(/a/));
        });
   });
}
```
:::

### Enable Ag Grid

Enable license key when deployed to portal

[read more about Ag Grid](../../modules/ag-grid/README.md)

```ts
import { enableAgGrid } from '@equinor/fusion-framework-module-navigation';
export const configure = (configurator) => enableAgGrid(configurator);
```

### Using Bookmarks

To enable bookmark for an application there are only one tinges needed. If the bookmark is enabled on in your portal. A function to capture the applications state is needed. The `currentBookmark` will be updated when ever the bookmark changes, and all navigation will be handled by parent application / portal.

[read more about Bookmarks](../../modules/bookmark/README.md)

```ts
import { useCurrentBookmark } from '@equinor/fusion-framework-react-app/bookmark';

const currentBookmark = useCurrentBookmark(
    useCallback(() => someApplicationState, [someApplicationState])
);
```
