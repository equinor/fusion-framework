---
title: Getting started
category: Guide
tags:
  - how to
  - basic
  - app
---

## Requirement

- [React 17+](https://reactjs.org/)

::: warning Dependencies
The Fusion Portal only supports React@17
:::

## Setup

### CLI

<ModuleBadge module="cli" />

```sh
yarn add --dev '@equinor/fusion-framework-cli'
```

### Frameowork

<ModuleBadge module="react-app" />

```sh
yarn add --dev '@equinor/fusion-framework-react-app'
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
  "extends": "@equinor/eslint-config-fusion/react",
}
```

@tab required packages
```sh
yarn add --dev @equinor/eslint-config-fusion eslint prettier
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
export const configure = (configurator, { env }) => {

  const { config: { environment: { endpoints } } } = env;

  for(const [key, endpoint] in Object.entries(endpoints)) {
    const { baseUri, defaultScopes } = endpoint;
    configurator.configureHttpClient({ key, { baseUri, defaultScopes });
  }
};
```

@tab app.config.js
```js
export default () => ({
  "environment": {
    "endpoints": {
      "api": {
        "baseUri": "https://foo.barz",
        "defaultScopes": ["foobar/.default"]
      }
    }
  }
});
```

:::

## Creating Application

### Main
@[code](@cookbooks/app-react/src/index.ts)


### Config
@[code](@cookbooks/app-react/src/config.ts)

### Component
@[code](@cookbooks/app-react/src/App.tsx)

::: info legacy

```ts
import { registerApp } from '@equinor/fusion';
import { createComponent } from '@equinor/fusion-framework-react-app';

registerApp(
  'my-app', 
  { 
    renderApp,
    AppComponent: <></> 
  }
);
```
:::

## Basic features

### Use http client

```ts
// config.ts
export const configure = (configurator, { env }) => {
  /** custom client */
  configurator.configureHttpClient({ "my-api", { 
    baseUri: 'https://foo.bar', 
    defaultScopes: 'foobar/.default'
  });
};

// useFooClient.ts
import { useModule } from '@equinor/fusion-framework-react-app';
import { useHttpClient } from '@equinor/fusion-framework-react-app/http';
import type { IHttpClient } from '@equinor/fusion-framework-react-app/http';

export const useFooClient = (): IHttpClient => {
  const httpProvider = useModule('http');
  return useHttpClient('foo');
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
```ts
import { enableNavigation } from '@equinor/fusion-framework-module-context';
export const configure = (configurator) => {
  enableContext(configurator, {
    /** optional filter for query types */
    contextType: ['project'],
    /** optional filter of query result */
    contextFilter: (items) => items.filter(item => item.title.match(/a/)) 
  });
}
```

### Enable Ag Grid

Enable license key when deployed to portal

[read more about Ag Grid](../../modules/ag-grid/README.md)

```ts
import { enableAgGrid } from '@equinor/fusion-framework-module-navigation';
export const configure = (configurator) => {
  enableAgGrid(configurator);
}
```
