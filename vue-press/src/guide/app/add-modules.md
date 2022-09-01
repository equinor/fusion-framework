---
title: Additional modules
category: Guide
tags:
  - how to
  - modules
  - app
---

```ts
// config.ts
import type { AppConfigurator } from '@equinor/fusion-framework-react-app';
import type { AgGridModule } from '@equinor/fusion-framework-module-ag-grid';

/** add interface of module to configurator for type hinting */
const configCallback: AppConfigurator<[AgGridModule]> = async (
  appModuleConfig, 
  frameworkApi
) => {}

// index.ts
import createApp from '@equinor/fusion-framework-react-app';
import moduleAgGrid from '@equinor/fusion-framework-module-ag-grid';

export const render = createApp(
  AppComponent, 
  configCallback,
  /** array of modules to initiate */
  [ moduleAgGrid ]
);
```