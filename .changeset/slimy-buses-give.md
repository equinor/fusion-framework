---
'@equinor/fusion-framework-module-app': major
'@equinor/fusion-framework-react-app': patch
'@equinor/fusion-framework-react-components-bookmark': patch
'@equinor/fusion-framework-react': minor
'@equinor/fusion-framework-legacy-interopt': patch
---

Adjusted module to the new app service API.

> [!WARNING]
> This will introduce breaking changes to the configuration of `AppConfigurator.client`.

**Added**

-   Introduced `AppClient` class to handle application manifest and configuration queries.
-   Added `zod` to validate the application manifest.

**Changed**

-   Updated `AppModuleProvider` to use `AppClient` for fetching application manifests and configurations.
-   Modified `AppConfigurator` to utilize `AppClient` for client configuration.
-   Updated `useApps` hook with new input parameter for `filterByCurrentUser` in `fusion-framework-react`.

**Migration**

before:

```ts
configurator.setClient({
    getAppManifest: {
        client: {
            fn: ({ appKey }) => httpClient.json$<ApiApp>(`/apps/${appKey}`),
        },
        key: ({ appKey }) => appKey,
    },
    getAppManifests: {
        client: {
            fn: () => httpClient.json$<ApiApp[]>(`/apps`),
        },
        key: () => `all-apps`,
    },
    getAppConfig: {
        client: {
            fn: ({ appKey }) => httpClient.json$<ApiApp>(`/apps/${appKey}/config`),
        },
        key: ({ appKey }) => appKey,
    },
});
```

after:

```ts
import { AppClient } from `@equinor/fusion-framework-module-app`;
configurator.setClient(new AppClient());
```

custom client implementation:

```ts
import { AppClient } from `@equinor/fusion-framework-module-app`;
class CustomAppClient implements IAppClient { ... }
configurator.setClient(new CustomAppClient());
```
