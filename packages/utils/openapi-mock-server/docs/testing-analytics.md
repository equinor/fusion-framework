# Test analytics locally

Fusion apps track feature usage with `useTrackFeature()` from
`@equinor/fusion-framework-react-app/analytics`. In production, the Fusion portal sends these
events to the Monitor service, Fusion's analytics pipeline stores them, and app admins read them
through the Apps service. Locally, `ffc mock-server` plays all three parts: it receives the
analytics the dev portal sends in `--mock` mode, reads them the way the analytics pipeline does,
records them, and answers the same query. You can then check tracked features in Playwright and
build usage pages against your own events — without live services and without waiting for the
pipeline.

## What is covered

| Covered | Not covered |
| --- | --- |
| Receiving `POST /v1/logs` from the dev portal, with the Monitor service's status codes | The real Monitor service, Event Hub, and Fabric |
| Reading events into the same rows and columns as Fusion's analytics pipeline | Production timing — events show up immediately, not after hourly loads |
| `app-feature`, `app-loaded`, `app-selected`, and `context-selected` events | Tables other than `event_app_features` through the query |
| The Apps service's `POST /apps/feature-events/query`, with Fabric's GraphQL schema, filters, paging, and limits | `groupBy`, and Fabric's exact GraphQL error wording |
| Recording every batch to a JSON Lines file, and loading recordings or `logs_*.json.gz` landing files at start | Production app-admin data (any signed-in user may query unless you set a rule) |
| Per-browser-session isolation, so parallel Playwright tests only see their own events | |

## How analytics flow

| Step | Production | Local with `ffc mock-server` |
| --- | --- | --- |
| Track | `useTrackFeature()` in the app | Same |
| Send | Fusion portal → `monitor` service, `POST /v1/logs` (OpenTelemetry logs) | Dev portal with `--mock` → mock `monitor` service, same request |
| Store | Monitor service adds `user.id`, stores the batch unchanged | Mock adds `user.id`, appends the batch to a JSON Lines recording |
| Read | `nb_fcore_featurelogs` notebook turns batches into `event_<name>` tables | Mock reads the batch the same way, right away |
| Query | Apps service `POST /apps/feature-events/query` → Fabric GraphQL | Mock `apps` service answers the same query from received and seeded events |

Without `--mock`, the dev portal sends no analytics anywhere, because the `monitor` service in
real service discovery is the production service.

## Start the mock server

Analytics are on by default. Start the mock server, then run the app against it:

```sh
ffc mock-server
ffc app dev --mock http://localhost:4010
```

The startup log shows where analytics are recorded:

```text
mock server listening at http://localhost:4010
receiving analytics, recording to .fusion-mock/analytics.jsonl
```

Every batch is appended to `.fusion-mock/analytics.jsonl`, one entry per line. The folder gets a
`.gitignore` so recordings are not committed by accident. Choose settings with flags or in
`dev-server.config.ts`; flags win over config, and config wins over `mockServerPlugin()` defaults:

```typescript
import type {} from '@equinor/fusion-framework-cli-plugin-mock-server';
import { defineDevServerConfig } from '@equinor/fusion-framework-cli';

export default defineDevServerConfig(() => ({
  mockServer: {
    analytics: {
      record: '.fusion-mock/analytics.jsonl',
      seed: ['recordings/analytics.jsonl'],
    },
  },
}));
```

| Flag | Config | Effect |
| --- | --- | --- |
| `--analytics-record <file>` | `analytics.record` | Recording file, relative to the project root. |
| `--no-analytics-record` | `analytics.record: false` | Keep received events in memory only. |
| `--analytics-seed <path>` (repeatable) | `analytics.seed` | Recordings, landing-zone files, or folders loaded at start. |
| `--no-analytics` | `analytics: false` | Do not receive analytics or answer the query. |

## Track features in the app

Nothing changes in the app. `useTrackFeature()` sends an `app-feature` event with the feature
name, the data you pass, the app key, and the current context:

```tsx
import { useTrackFeature } from '@equinor/fusion-framework-react-app/analytics';
import { useLocation } from '@equinor/fusion-framework-react-router';
import { useEffect } from 'react';

export function usePageViewTracking(): void {
  const { pathname } = useLocation();
  const trackFeature = useTrackFeature();

  useEffect(() => {
    trackFeature('page-viewed', { route: pathname });
  }, [pathname, trackFeature]);
}
```

The dev portal also sends the Fusion portal's own `app-loaded`, `app-selected`, and
`context-selected` events. Turn on the `fusionLogAnalytics` feature flag in the dev portal to see
every event in the browser console as well.

## Check analytics in Playwright

`createMockAnalytics()` from `@equinor/fusion-openapi-mock-server` reads the events the app sent.
Give each test its own mock-auth user with `createMockAuth()`, so the test has its own analytics
session and parallel tests do not see each other's events:

```typescript
import { createMockAnalytics, createMockAuth } from '@equinor/fusion-openapi-mock-server';
import { expect, test } from '@playwright/test';

const mockAuth = createMockAuth('http://localhost:4010');
const analytics = createMockAnalytics('http://localhost:4010');

test.beforeEach(async ({ context }, testInfo) => {
  await mockAuth.setUser(context.request, { userId: `analytics-${testInfo.testId}` });
  await analytics.reset(context.request);
});

test('tracks page views', async ({ context, page }) => {
  await page.goto('/apps/my-app/people');

  const event = await analytics.waitFor(context.request, { feature: 'page-viewed' });

  expect(JSON.parse(event.data_body_data ?? 'null')).toEqual({ route: '/people' });
});
```

- `list(request, filter?)` returns the session's received events, oldest first. Filter by
  `eventName`, `appKey`, or `feature`.
- `waitFor(request, { feature, match?, timeout? })` polls until a matching event arrives. The
  framework sends analytics in batches about a second apart, so wait rather than reading once.
  On timeout, the error lists the events that did arrive.
- `reset(request)` removes the session's received events; seeded history stays.
- A browser without a selected mock-auth user sends events as `fusion-mock-user` in the shared
  `local-development` session. Read it with `list(request, { session: 'local-development' })`.

Tracked data arrives as `data_body_data` JSON text, exactly as the Apps service returns it, so
parse it before comparing. See the
[mock Playwright cookbook](../../../../cookbooks/app-react-mock-playwright/playwright/analytics.spec.ts)
for page views, tracked data, the query, and parallel contexts.

## Read usage data like an analytics page

An app's own usage page calls the Apps service's `POST /apps/feature-events/query` — for example
with `queryAppFeatureEvents` from `@equinor/fusion-services/apps` and the framework `apps` client.
The mock answers it with the events of the caller's browser session plus the seeded history:

```typescript
import { queryAppFeatureEvents } from '@equinor/fusion-services/apps';

const response = await queryAppFeatureEvents('v1', appsClient)({
  query: `query AppFeatureEvents($appKey: String!, $first: Int!) {
    event_app_features(
      first: $first
      orderBy: { timestamp: DESC }
      filter: { data_appkey: { eq: $appKey }, event_name: { eq: "app-feature" } }
    ) {
      items { timestamp data_feature data_body_data user_id session_id }
      hasNextPage
      endCursor
    }
  }`,
  variables: { appKey: 'my-app', first: 100 },
});
```

The query runs against Fabric's `event_app_features` schema with production behavior:

- every filter operator (`eq`, `neq`, `contains`, `notContains`, `startsWith`, `endsWith`, `in`,
  `isNull`, `gt`, `gte`, `lt`, `lte`, `and`, `or`), with SQL null semantics;
- `orderBy`, variables, operation names, and introspection;
- `first` (default 100, `-1` for all, at most 100 000) and cursor paging with `after`,
  `endCursor`, and `hasNextPage`;
- problems in the GraphQL `errors` list with HTTP 200, as through the real Apps service.

### Replace hand-written sample events

If your mock server writes sample `event_app_features` rows by hand, remove that route and seed a
recording instead. Use the app with `--mock` to produce realistic events, keep the resulting
`.fusion-mock/analytics.jsonl`, and load it with `--analytics-seed`. The events then go through
the same reading and query code as live ones.

## Record and seed analytics

A recording is a JSON Lines file: each line is one OpenTelemetry `ResourceLogs` entry with the
`user.id` resource attribute, the same format as the `logs_*.json.gz` files in Fusion's analytics
landing zone. The mock appends one line per received entry and never rewrites the file.

Seed paths can be:

- a recording from an earlier run;
- a gzipped landing-zone file such as `logs_20261005160000.json.gz` (detected by content);
- a folder, searched recursively for `.jsonl`, `.ndjson`, and `.json` files, plain or gzipped,
  in path order.

Seeded events are visible to every session and survive `POST /@fusion-mock/reset`, which removes
only received events. Lines that cannot be read are skipped with a `file:line` warning; a seed
path that does not exist stops startup.

## Event fields

Events have the columns of the analytics pipeline's `event_<name>` tables. For `app-feature`
events, which the query returns:

| Column | Source |
| --- | --- |
| `data_feature` | Feature name passed to `trackFeature` |
| `data_body_data` | Data passed to `trackFeature`: compact JSON for objects and arrays, text for scalars, `null` when omitted |
| `data_appkey` | App that tracked the feature |
| `data_context_id`, `data_context_type`, `data_context_title`, `data_context_external_id`, `data_context_source` | Current context, or `null` |
| `user_id` | Signed-in user, added by the Monitor service (the mock-auth user locally) |
| `session_id` | Analytics session of the browser tab (new on every page load) |
| `portal_id` | Portal that sent the event; `dev-portal` locally |
| `module_version` | Version of the analytics module that sent the event |
| `timestamp`, `event_date` | When the event happened, and its UTC day |
| `event_id`, `severity_number`, `_source_file`, `_ingest_ts` | Row id, `9`, the recording or seed file, and when the mock read the event |

`app-loaded` events get `data_appkey`, `data_displayname`, `data_type`, `data_categoryname`,
`data_buildversion`, `data_buildtag`, and the context columns. `app-selected` events get
`data_appkey` and `data_previous_appkey`. `context-selected` events get `data_appkey`, `data_id`,
`data_type`, `data_title`, `data_external_id`, `data_source`, and the `data_previous_*` columns.
Other events keep `data_body` and `data_attributes` as JSON.

## Differences from production

- Events show up immediately; production loads them in batches, typically hourly.
- `portal_id` is `dev-portal`, not the production portal's name.
- The query allows every signed-in user unless you pass `isAppAdmin` to
  `defineAppFeatureEventsMock`; the real Apps service only answers app admins.
- GraphQL validation and syntax errors come from `graphql-js`, so their wording differs from Fabric.
- Cursors are opaque but not Fabric's tokens; do not store them.
- Like production, an event whose value is a plain string or number instead of an object stores
  `null` data. `useTrackFeature` always sends an object.

## Use the mocks programmatically

`ffc mock-server` wires these for you. For a programmatic mock server, share one store between the
Monitor and Apps mocks from `@equinor/fusion-openapi-mock-server/presets/fusion`:

```typescript
import { createMockServer } from '@equinor/fusion-openapi-mock-server';
import {
  defineAnalyticsMock,
  defineAppFeatureEventsMock,
} from '@equinor/fusion-openapi-mock-server/presets/fusion';

const monitor = defineAnalyticsMock({
  record: '.fusion-mock/analytics.jsonl',
  seed: ['recordings'],
});

const server = createMockServer();
server.use('fusion');
server.use([monitor, defineAppFeatureEventsMock({ store: monitor.store })]);
await server.start({ port: 4010 });

const rows = monitor.store.getRows(); // event-table rows, seeded first
```

The same entry point exports the reading functions for Vitest or scripts:
`parseOtlpLogsRequest`, `parseOtlpResourceLog`, `projectAnalyticsEvent`,
`readAnalyticsRecordings`, and `executeAppFeatureEventsQuery`.

## Mock analytics reference

| Route | Behavior |
| --- | --- |
| `POST /monitor/v1/logs` (discovery key `monitor`) | `202` when accepted; `400` for invalid JSON, nesting deeper than 64 levels, or no log entries; `401` without a signed-in user; `415` when a JSON body is not declared as `application/json`. |
| `POST /apps/apps/feature-events/query` (discovery key `apps`) | GraphQL over the caller's session events plus seeded history; `401` without a signed-in user; `403` when `isAppAdmin` rejects the user. |
| `GET /@fusion-mock/analytics` | `{ events }` for the caller's session, or every session without a session cookie. Query parameters: `eventName`, `appKey`, `feature`, `session`, `includeSeeded=true`. |
| `DELETE /@fusion-mock/analytics` | Removes the caller's received events (or `?session=`), keeping seeded history. |

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| No `receiving analytics` line at startup | Analytics are turned off (`--no-analytics` or `analytics: false`), or a local `monitor.mock.ts` replaces the analytics mock. |
| `waitFor` times out with `Received 0 event(s)` | The app is not running with `--mock`, the test's browser context has a different mock-auth user than the request client, or the feature is never tracked. |
| Events appear under `local-development` | No mock-auth user is selected for the browser; call `createMockAuth().setUser(context.request, …)` before opening the page. |
| Browser console warns `Analytics are not sent` | The mock server serves no `monitor` service; start it without `--no-analytics`. |
| Query returns `errors` | The query uses a field or argument Fabric's schema does not have (`groupBy`, a misspelled column), or an invalid `first` or cursor. |
| Mock server fails at startup | A seed path does not exist. |
| Events from before a reload are missing | Reloads flush the last batch on `pagehide`, but a hard browser close can drop it; wait for the event before reloading. |
