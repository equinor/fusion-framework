---
title: Legacy
category: Guide
tags:
  - guide
  - legacy
---

For some apps, replacing `react-router` is a daunting task. 
With this method the app will



```ts
import { registerApp } from '@equinor/fusion';
import { createLegacyApp } from '@equinor/fusion-framework-react-app';
import { configureSomething } from '@equinor/fusion-framework-module-some-module';

const Component: React.ComponentType = () => { ... }

registerApp(
  'my-app', 
  { 
    AppComponent: createLegacyApp(Component, (config) => {
      config.addConfig(configureSomething());
    });
  }
);
```