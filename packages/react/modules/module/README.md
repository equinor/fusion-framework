# React Module

## Concept

This module should provide React developers with utils for initializing and consume modules.

## Usage

__INTERNAL_MODULE__

> In general this package is implemented by framework/app scaffolding

- @equinor/fusion-framework-react-app
- @equinor/fusion-framework-react-framework

## Requirements

- React >= 17

this module requires __React 17__ or higher since the creation, configuration and initializing of modules are async. The provider must be wrapped in an `Suspense` components

## Example

### Create a provider component
```tsx
import { Suspense } from 'react';

import http, { HttpModule } from '@equinor/fusion-framework-module-http';
import msal, { MsalModule } from '@equinor/fusion-framework-module-msal';

import { createModuleProvider } from '@equinor/fusion-framework-react-module';

export const ModuleProvider = createModuleProvider((config) => {
    config.auth.configureDefault({
        tenantId: 'MY_TENANT_ID',
        clientId: 'MY_CLIENT_ID',
        redirectUri: '/authentication/login-callback',
    });
    config.http.configureClient('foo', {
        baseUri: 'https://foo.bar',
        defaultScopes: ['FOO_CLIENT_ID/.default'],
    });
  },
  [http, msal]
)
```

### Create a app component (consumer)
```tsx
import { useModule } from '@equinor/fusion-framework-react-module';

const AppComponent = () => {
  const http = useModule('http');
  const client = http.createClient('foo');
  return (
    <button onClick={client.fetchAsync('/api/todo')}>Fetch todo</button>
  );
}
```

### Render App
```tsx
import ReactDOM from 'react-dom';

import { ModuleProvider } from './Provider';
import { AppComponent } from './AppComponent';

ReactDOM.render(
  <Suspense fallback={<span>Loading framework</span>}>
    <ModuleProvider>
      <AppComponent />
    </ModuleProvider>
  </Suspense>,
  document.getElementById('root')
);
```