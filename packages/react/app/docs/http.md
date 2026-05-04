# HTTP

Make authenticated HTTP calls from your Fusion app using the framework-managed HTTP client.

**Import:**

```ts
import { useHttpClient } from '@equinor/fusion-framework-react-app/http';
```

**Selectors sub-path:**

```ts
import { jsonSelector, blobSelector } from '@equinor/fusion-framework-react-app/http/selectors';
```

## Overview

The `useHttpClient` hook provides access to named HTTP clients that are pre-configured with authentication, base URLs, and interceptors. Clients must be registered in the app configurator before use — the hook creates a memoised client instance by name.

The `selectors` sub-path re-exports response selectors (`jsonSelector`, `blobSelector`, `createSseSelector`) from the HTTP module, providing typed helpers for parsing fetch responses.

## Configure an HTTP Client

Register a named client in your app's configuration callback:

```ts
import type { AppConfigurator } from '@equinor/fusion-framework-react-app';

export const configure = (configurator: AppConfigurator) => {
  configurator.configureHttpClient('my-api', {
    baseUri: 'https://api.example.com',
    defaultScopes: ['api://my-api/.default'],
  });
};
```

## useHttpClient

Returns a configured `IHttpClient` instance by name. Throws if no client is registered for the given key.

**Signature:**

```ts
function useHttpClient(name: string): IHttpClient;
```

| Parameter | Type     | Description                          |
| --------- | -------- | ------------------------------------ |
| `name`    | `string` | Named client key from configuration  |

**Returns:** An `IHttpClient` instance with `fetch`, `json`, `blob`, and other request methods.

### Fetch JSON Data

```tsx
import { useEffect, useState } from 'react';
import { useHttpClient } from '@equinor/fusion-framework-react-app/http';
import { jsonSelector } from '@equinor/fusion-framework-react-app/http/selectors';

type Item = { id: string; name: string };

const ItemList = () => {
  const client = useHttpClient('my-api');
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    client.fetch('/items', { selector: jsonSelector })
      .then(setItems);
  }, [client]);

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
};
```

### POST Data

```tsx
import { useCallback } from 'react';
import { useHttpClient } from '@equinor/fusion-framework-react-app/http';

const CreateItem = () => {
  const client = useHttpClient('my-api');

  const handleSubmit = useCallback(async (name: string) => {
    await client.fetch('/items', {
      method: 'POST',
      body: JSON.stringify({ name }),
      headers: { 'Content-Type': 'application/json' },
    });
  }, [client]);

  return <button onClick={() => handleSubmit('New item')}>Create</button>;
};
```

## Response Selectors

The `selectors` sub-path provides typed helpers for parsing HTTP responses:

| Selector             | Description                                    |
| -------------------- | ---------------------------------------------- |
| `jsonSelector`       | Parses response as JSON with type inference     |
| `blobSelector`       | Returns response as a `Blob`                   |
| `createSseSelector`  | Creates a selector for Server-Sent Events streams |

These are re-exported from `@equinor/fusion-framework-module-http/selectors`.

## Prerequisites

- HTTP clients must be configured in your app's configurator before calling `useHttpClient`
- Authentication scopes are attached automatically based on the client configuration
- For detailed HTTP module configuration, see the [`@equinor/fusion-framework-module-http` documentation](../../modules/http/README.md)
