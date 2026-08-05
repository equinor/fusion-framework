---
"@equinor/fusion-framework-module-services": minor
---

Add `AppStateApiClient` for the Fusion App State API, exposed via a new `./app-state` subpath export and `ApiProvider.createAppStateClient()`.

The client follows the same versioned method pattern as `bookmarks`/`context`/`notification`: every method takes an API version as its first argument (currently only `'v1'` is supported).

```typescript
import { AppStateApiClient } from '@equinor/fusion-framework-module-services/app-state';
import { HttpClient } from '@equinor/fusion-framework-module-http';

const httpClient = new HttpClient({ baseUri: 'https://app-state-api.example.com/' });
const client = new AppStateApiClient(httpClient, 'json');

const apps = await client.listMyApps('v1');
await client.wipeMyAppState('v1', { appKey: 'my-app' });
```

Supported operations: `listMyApps`, `getMyAppState`, `wipeMyAppState`, `wipeAllMyState`, `listAppUsers`, `getUserAppState`, `wipeUserAppState`, `wipeAllAppUsersState`.
