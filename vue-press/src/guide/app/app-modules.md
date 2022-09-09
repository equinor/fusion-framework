---
title: Modules
category: Guide
tags:
 - modules
 - basic
 - app
 - http
---

<ModuleBadge module="react-app" />
<ModuleBadge module="app" />


## HTTP
<ModuleBadge module="module-http" />

```ts
// config.ts
config.http.configureClient(
  'bar', 
  {
    baseUri: 'https://foo.bar',
    defaultScopes: ['foobar/.default']
  }
);

// useFooClient.ts
import { useModule } from '@equinor/fusion-framework-react-app';
import { useHttpClient } from '@equinor/fusion-framework-react-app/http';
import type { IHttpClient } from '@equinor/fusion-framework-react-app/http';

export const useFooClient = (): IHttpClient => {
  const httpProvider = useModule('http');
  return useHttpClient('foo');
}
```

[read more](/modules/http)

## App Config

```ts
import { useAppConfig } from '@equinor/fusion-framework-react-app/config';
const useBarConfig = () => {
  const config = useAppConfig({bar: 'not initialized'});
  return config.bar;
}
```