---
title: AG Grid
category: Module
tags: 
  - table
  - external
---

<ModuleBadge module="module-ag-grid" />

This module is for configuring the license key of Ag Grid.

When installing this module, `@ag-grid-enterprise/core` is installed as a peer dependency.

read more for usage of [AG Grid](https://www.ag-grid.com/)

> in the future a `@equinor/fusion-framework-react-module-ag-grid` will be created, which also exposes 
> plugins/extensions for react, see [Fusion React Component](https://github.com/equinor/fusion-react-components)

## Configuration
:::: code-group
::: code-group-item App:active
```ts
import { configureModules } from '@equinor/fusion-framework-app"';
import { enableAgGrid } from '@equinor/fusion-framework-module-ag-grid';

const initializeApp = configureModules((config) => {
  enableAgGrid(config);
} 
```
:::

::: code-group-item Portal
```ts
import { FusionConfigurator } from '@equinor/fusion-framework';
import { configureAgGrid } from '@equinor/fusion-framework-module-ag-grid';

const configurator = new FusionConfigurator();
configurator.addConfig(configureAgGrid({
  licenseKey = 'my-license-key'
}));
```
:::

::::

### React

:::: code-group
::: code-group-item App:active
```ts
import { createComponent } from '@equinor/fusion-framework-react-app"';
import { enableAgGrid } from '@equinor/fusion-framework-module-ag-grid';

const initializeApp = createComponent((config) => {
  enableAgGrid(config);
} 
```
:::

::: code-group-item Portal
```ts
import { createFrameworkProvider } from '@equinor/fusion-framework-react';
import { configureAgGrid } from '@equinor/fusion-framework-module-ag-grid';

createFrameworkProvider((config) => {
  config.addConfig(configureAgGrid({
    licenseKey = 'my-license-key'
  }));
})
```
:::

::: code-group-item Legacy app
```ts
import { registerApp } from '@equinor/fusion';
import { createLegacyApp } from '@equinor/fusion-framework-react-app';
import { enableAgGrid } from '@equinor/fusion-framework-module-ag-grid';

import App from from './App';

registerApp('my-app', { 
  AppComponent:  createLegacyApp(
    App, 
    (config) => enableAgGrid(config)
  )
});
```
:::

::::