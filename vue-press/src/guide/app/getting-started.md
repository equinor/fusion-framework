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

<ModuleBadge module="react-app" />

```sh
yarn add -D '@equinor/fusion-framework-react-app'
```

## Configuration
```ts
/** config.ts */
import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';

import { enableAgGrid } from '@equinor/fusion-framework-react-app';

export const configure: AppModuleInitiator = async (config, { fusion }) => {
  enableAgGrid(config);
  await config.useFrameworkServiceClient(fusion, 'portal');
  /** configure a custom client */  
  config.configureHttpClient({
    'bar', 
    {
      baseUri: 'https://foo.bar',
      defaultScopes: ['foobar/.default']
    }
  });
};
```

## Component
```tsx
import { useAppModules } from '@equinor/fusion-framework-react-app';
import { useAppModules } from '@equinor/fusion-framework-react-app';
import { useFramework } from '@equinor/fusion-framework-react-app/framework';

export const AppComponent = (): JSX.Element => {
  /** modules registered in framework (Fusion) */
  const framework = useFramework();

  /** local modules in app scope */
  const modules = useAppModules();
  
  /** use a http client */
  const barClient = useHttpClient('bar');

  return <>
    <h3>Registered modules in Framework</h3>
    <ul>
        {Object.keys(framework.modules).map((x) => (
            <li key={x}>{x}</li>
        ))}
    </ul>
    <h3>Registered modules in App</h3>
    <ul>
        {Object.keys(modules).map((x) => (
            <li key={x}>{x}</li>
        ))}
    </ul>
    <button onClick={() => barClient.fetch('/foo')}>Fetch Foo</button>
  </>
};
```

## Render

```ts
import { registerApp } from '@equinor/fusion';
import { createComponent } from '@equinor/fusion-framework-react-app';

registerApp(
  'my-app', 
  { 
    render: createComponent(AppComponent, configCallback),
    AppComponent 
  }
);
```
