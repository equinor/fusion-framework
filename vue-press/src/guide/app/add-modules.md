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
import { configureModules } from '@equinor/fusion-framework-app';
import { enableAgGrid } from '@equinor/fusion-framework-module-ag-grid';

import myModule from './myModule';

configureModules(config => {
  /** add a config for a module with helper */
  enableAgGrid(config)

  /** add a module without helper */
  config.addConfig({
    module: myModule,
    configure: (config) => {
        config.myConfig = 'foobar';
    },
  })
});