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

## Installation

install cli

<ModuleBadge module="cli" />

```sh
yarn add --dev '@equinor/fusion-framework-cli'
```

install framework
<ModuleBadge module="react-app" />

```sh
yarn add --dev '@equinor/fusion-framework-react-app'
```

## Configuration

```ts
/** config.ts */
import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
export const configure: AppModuleInitiator = async (configurator, { fusion, env }) => {
  ...
};
```

### Application Config

When the application renders, the portal will load configuration from `app service`


```ts
export const configure = (configurator, { env }) => {

  const { config: { services, environment } } = env;
  const { defaultScopes } = environment;

  for( const [key, baseUri] in Object.entries(services) ){
    configurator.configureHttpClient({ key, { baseUri, defaultScopes }
  }
};
```

::: note
Soon the app config attribute for services will have an property for `defaultScopes` 
:::

### Service http clients

[see available services](../../modules/service-discovery/)

[see http module](../../modules/http/)

```ts
export const configure = (configurator) => {
  /** enable usage of fusion portal api service  */
  await configurator.useFrameworkServiceClient('portal');
}
```


### Context
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

### Navigation
Enable routing in application

[read more about navigation](../../modules/navigation/README.md)

```ts
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
export const configure = (configurator, { env: { basename } }) => {
  enableNavigation(configurator, basename);
}
```


### Ag Grid

Enable license key when deployed to portal

[read more about Ag Grid](../../modules/ag-grid/README.md)

```ts
import { enableAgGrid } from '@equinor/fusion-framework-module-navigation';
export const configure = (configurator) => {
  enableAgGrid(configurator);
}
```

## Component
```tsx
import { createRoot } from 'react-dom/client';
import { makeComponent, ComponentRenderArgs } from '@equinor/fusion-framework-react-app';

import configure from './config';

import App from './App';

/** render callback function */
export const renderApp (el: HTMLElement, args: ComponentRenderArgs) {
    const root = createRoot(el);

    /** make render component */
    const Component = makeComponent(<App />, args, configure);

    /** render app component */
    root.render(<Component />);

    /** teardown */
    return () => root.unmount();
}

export default renderApp;
```

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
