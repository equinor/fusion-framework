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
import { createApp } from '@equinor/fusion-framework-react-app"';
import moduleAgrGrid, { AgGridModule } from '@equinor/fusion-framework-module-ag-grid';

const initializeApp = createApp<[AgGridModule]>(
  AppComponent,
  
  /** apps will use the license key by parent scope */
  async(config) = {}

  /** provide the module for instantiation */
  [moduleAgGrid]
);
```
:::

::: code-group-item Portal
```ts
import moduleAgrGrid, { AgGridModule } from '@equinor/fusion-framework-module-ag-grid';

export const Framework = createFrameworkProvider<[AgGridModule]>(
  async(config) => {
    config.agGrid.licenseKey = 'my-license-key'
  },
  [moduleAgGrid]
);
```
:::

::::
