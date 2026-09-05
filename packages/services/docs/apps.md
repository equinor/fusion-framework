# Fusion Apps service

The Apps client provides tree-shakeable access to the Fusion Apps API. Use it to manage
applications and widgets, their builds and bundles, tags, categories, context types, governance
records, per-person settings and pinned apps, changelog entries, and the technology-product
libraries governance draws on.

All 108 operations are exported from:

```text
@equinor/fusion-services/apps
```

## Create an HTTP client

Apps functions accept an `IHttpClient` from `@equinor/fusion-framework-module-http`. The HTTP
module supplies the base URL and authentication token; `@equinor/fusion-services` supplies the
typed request path, payload, and response validation.

```ts
const appsClient = await modules.http.createClient('apps');
```

## Fetch and manage apps

```ts
import {
  createApp,
  deleteApp,
  getApp,
  listApps,
  restoreApp,
  updateApp,
} from '@equinor/fusion-services/apps';

const app = await getApp('v1', appsClient)({
  appIdentifier: 'my-app',
});

const page = await listApps('v1', appsClient)({
  search: 'reporting',
  filter: "type eq 'standalone'",
});

await createApp('v1', appsClient)({
  appKey: 'incident-board',
  displayName: 'Incident board',
  description: 'Tracks active operational incidents',
});

await updateApp('v1', appsClient)({
  appIdentifier: 'incident-board',
  displayName: 'Incident board (beta)',
});

await deleteApp('v1', appsClient)({ appIdentifier: 'incident-board' });
await restoreApp('v1', appsClient)({ appIdentifier: 'incident-board' });
```

`getApp` accepts an app id or an app key. Collection operations return a paged envelope whose
`value` property contains the matching resources.

## Publish and address app builds

A build is one uploaded version of an app. Tags name a build so consumers can follow a moving
target such as `latest` or `preview`.

```ts
import {
  getAppAtVersion,
  getAppBuild,
  getAppBuildConfig,
  listAppBuilds,
  registerAppTag,
  uploadAppBundle,
  upsertAppBuildConfig,
} from '@equinor/fusion-services/apps';

// The bundle payload is outside the JSON contract, so it is passed through `init`.
await uploadAppBundle('v1', appsClient)({ appIdentifier: 'my-app' }, {
  body: bundleArchive,
  headers: { 'content-type': 'application/zip' },
});

const builds = await listAppBuilds('v1', appsClient)({ appIdentifier: 'my-app' });

const build = await getAppBuild('v1', appsClient)({
  appIdentifier: 'my-app',
  versionIdentifier: '1.2.3',
});

await upsertAppBuildConfig('v1', appsClient)({
  appIdentifier: 'my-app',
  versionIdentifier: '1.2.3',
  environment: { LOG_LEVEL: 'debug' },
});

await registerAppTag('v1', appsClient)({
  appIdentifier: 'my-app',
  tagName: 'preview',
  version: '1.2.3',
});

// `appIdentifier@versionIdentifier` addresses an app together with one of its builds.
const appAtVersion = await getAppAtVersion('v1', appsClient)({
  appIdentifier: 'my-app',
  versionIdentifier: 'preview',
});
```

## Read bundle content

Bundle endpoints serve archives and static assets rather than JSON, so their result is the
response blob together with the file name the service published for it.

```ts
import { getAppBundleArchive, getAppBundleResource } from '@equinor/fusion-services/apps';

const { blob, filename } = await getAppBundleArchive('v1', appsClient)({
  appIdentifier: 'my-app',
  versionIdentifier: '1.2.3',
});

const asset = await getAppBundleResource('v1', appsClient)({
  appIdentifier: 'my-app',
  versionIdentifier: '1.2.3',
  resource: 'assets/app-bundle.js',
});
```

## Work with the signed-in person

`/persons/me` operations resolve the signed-in person from the access token, so they take no
account identifier. The `Person` variants address another account explicitly.

```ts
import {
  getMyApp,
  listMyApps,
  listMyPinnedApps,
  pinMyApp,
  setMyAppTag,
  unpinMyApp,
  upsertMyAppSettings,
} from '@equinor/fusion-services/apps';

const myApps = await listMyApps('v1', appsClient)();

const myApp = await getMyApp('v1', appsClient)({ appIdentifier: 'my-app' });

// Overrides which build this person receives by default.
await setMyAppTag('v1', appsClient)({ appIdentifier: 'my-app', tag: 'preview' });

await upsertMyAppSettings('v1', appsClient)({
  appIdentifier: 'my-app',
  settings: { theme: 'dark' },
});

await pinMyApp('v1', appsClient)({ appKey: 'my-app' });
await listMyPinnedApps('v1', appsClient)();
await unpinMyApp('v1', appsClient)({ appIdentifier: 'my-app' });
```

## Govern an app

Governance records the ownership, classification, and documentation an application is required to
maintain.

```ts
import {
  confirmAppGovernance,
  createAppGovernanceDocument,
  getAppGovernance,
  listAppCompliance,
  updateAppGovernance,
} from '@equinor/fusion-services/apps';

const governance = await getAppGovernance('v1', appsClient)({ appIdentifier: 'my-app' });

await updateAppGovernance('v1', appsClient)({
  appIdentifier: 'my-app',
  supportsAllProjectPhases: true,
});

await createAppGovernanceDocument('v1', appsClient)({
  appIdentifier: 'my-app',
  type: 'AppOwnership',
  content: '# Ownership\n\nThe app is owned by the incident response team.',
});

await confirmAppGovernance('v1', appsClient)({ appIdentifier: 'my-app' });

const findings = await listAppCompliance('v1', appsClient)({ appIdentifier: 'my-app' });
```

## Choose an API version

The version is the first argument to every operation. Apps API 1.0 can be selected with `'v1'`,
`'1.0'`, or `ApiVersion.v1`.

```ts
import { ApiVersion, getApp } from '@equinor/fusion-services/apps';

await getApp('v1', appsClient)({ appIdentifier: 'my-app' });
await getApp('1.0', appsClient)({ appIdentifier: 'my-app' });
await getApp(ApiVersion.v1, appsClient)({ appIdentifier: 'my-app' });
```

Unsupported versions fail before the HTTP client sends a request. The selected version controls:

- The accepted operation arguments
- The `api-version` query parameter
- The response schema
- The inferred TypeScript response type

## Use operation and model types

Each operation exports version, argument, response, and result types. API models carry their API
version in the type name.

```ts
import type {
  ApiAppV1,
  GetAppArg,
  GetAppResponse,
  GetAppResult,
} from '@equinor/fusion-services/apps';

type Arguments = GetAppArg<'v1'>;
type Response = GetAppResponse<'v1'>;
type PromiseResult = GetAppResult<'v1'>;
type ObservableResult = GetAppResult<'v1', 'json$'>;
```

`ApiAppV1` and other API model types are inferred from their versioned Zod schemas. Request
arguments and response payloads are validated at runtime; invalid values throw a `z.ZodError`.
Schema and field descriptions provide domain context alongside each validation issue path.

Operations the contract publishes without a response schema — such as the person settings
endpoints, the feature-events query, and the cached-apps listing — resolve to `unknown` and reach
the caller unvalidated. Operations answering an empty success resolve to `void`.

## Use promises or observables

The optional third argument selects the `IHttpClient` method:

```ts
const promisedApp = getApp('v1', appsClient, 'json')({
  appIdentifier: 'my-app',
});

const streamedApp = getApp('v1', appsClient, 'json$')({
  appIdentifier: 'my-app',
});
```

`json` is the default and returns a promise. `json$` returns a `StreamResponse` observable with the
same response payload type.

## Mock the Apps API

The complete Apps API 1.0 OpenAPI document ships as a versioned JSON subpath:

```ts
import appsV1OpenApi from '@equinor/fusion-services/apps/v1/openapi.json' with {
  type: 'json',
};
```

The snapshot contains every operation, component schema, security declaration, tag, and server
published by the service. It can drive contract-aware mocks or test data generation without a
network request.

TypeScript projects importing the JSON snapshot need `resolveJsonModule` and a module resolution
mode that honors package exports, such as `bundler`, `node16`, or `nodenext`.

## Operation families

| Family | Capabilities |
| --- | --- |
| Applications | CRUD, soft delete and restore, existence checks, compliance findings, and tagged persons |
| Builds and bundles | Build listing, build configuration, bundle upload, and bundle content retrieval |
| Tags | App and widget tags, tag history, and the builds a tag currently names |
| Categories | CRUD for app categories and their changelog |
| Governance | Governance records, confirmations, documents, and properties |
| Persons | Apps, settings, build overrides, and pinned apps for the signed-in person or another account |
| Widgets | CRUD, builds, build configuration, bundles, and tags |
| Context types and libraries | Context types, business owner roles, data classifications, document types, and technology products |
| Platform | Changelog, feature-event queries, event subscriptions, and cache administration |

The `check*Access` functions implement the `OPTIONS` operations the service publishes. They answer
`204 No Content`; the allowed-method information the service returns lives in response headers,
which this JSON client does not surface.

Use editor completion and the exported TSDoc for operation-specific argument, response, error, and
authorization details.
