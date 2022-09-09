---
title: Legacy
category: Guide
tags:
  - guide
  - legacy
---



```ts
import { createLegacyApp } from '@equinor/fusion-framework-react-app';
import type { AppConfigCallback } from '@equinor/fusion-framework-react-app/config';
import someModule, { SomeModule } from '@equinor/fusion-framework-module-some-module';

const RootComponent: React.ComponentType = () => { ... }
const configCallback: AppConfigCallback<[SomeModule]> = (config) => { ... }

const AppComponent = createLegacyApp(RootComponent, configCallback, [someModule]);

import { registerApp } from '@equinor/fusion';
registerApp('my-app', { AppComponent });
```