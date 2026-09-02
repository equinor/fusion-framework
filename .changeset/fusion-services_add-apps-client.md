---
"@equinor/fusion-services": minor
---

Add the Fusion Apps API 1.0 client as the `@equinor/fusion-services/apps` export.

All 108 published operations are exported as standalone, tree-shakeable endpoint functions,
following the same version-discriminated contract as the Roles client: bind the API version, an
`IHttpClient`, and the execution method once, then call the returned function with the operation
arguments.

```ts
import { getApp, listApps, upsertMyAppSettings } from '@equinor/fusion-services/apps';

const app = await getApp('v1', appsClient)({ appIdentifier: 'my-app' });
const page = await listApps('v1', appsClient)({ search: 'reporting' });

await upsertMyAppSettings('v1', appsClient)({
  appIdentifier: 'my-app',
  settings: { theme: 'dark' },
});
```

The client covers applications, widgets, builds and bundles, tags, categories, context types,
governance records and documents, per-person apps, settings and pinned apps, changelog entries,
feature-event queries, event subscriptions, and cache administration. Version-scoped Zod schemas
validate every request argument and documented response body, and each API model type — `ApiAppV1`,
`CreateAppRequestV1`, and the rest — is inferred from its schema.

The Apps API 1.0 OpenAPI document remains available as
`@equinor/fusion-services/apps/v1/openapi.json`, and is now the contract the client is generated
from and checked against with `check:openapi apps`.
