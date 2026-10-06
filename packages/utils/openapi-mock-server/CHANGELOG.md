# @equinor/fusion-openapi-mock-server

## 0.5.0

### Minor Changes

- efdf820: Check recorded analytics from tests with `createMockAnalytics()`.
  
  `createMockAnalytics(mockServerUrl)` from `@equinor/fusion-openapi-mock-server` reads the analytics a Fusion app sent to the mock Monitor service (`defineAnalyticsMock`):
  
  - `list(request, filter?)` returns the received events, narrowed by `eventName`, `appKey`, or `feature`.
  - `waitFor(request, { feature, match?, timeout? })` resolves with the first matching event. The framework sends analytics in batches, so tests should wait rather than read once. When nothing matches in time, the error lists what did arrive.
  - `reset(request)` removes received events and keeps seeded history.
  
  Pass Playwright's `context.request`. When the browser context has a mock-auth user, only that session's events are read and cleared, so parallel tests stay apart. Use `{ session: 'local-development' }` for a browser without a selected user.
  
  ```ts
  const analytics = createMockAnalytics('http://localhost:4010');
  test.beforeEach(({ context }) => analytics.reset(context.request));
  
  test('tracks page views', async ({ context, page }) => {
    await page.goto('/apps/my-app/people');
    const event = await analytics.waitFor(context.request, { feature: 'page-viewed' });
    expect(JSON.parse(event.data_body_data ?? '{}')).toEqual({ route: '/people' });
  });
  ```
  
  The helper uses the new `GET` and `DELETE /@fusion-mock/analytics` control routes. Service definitions can add their own control routes at `/@fusion-mock/<name>` with `defineService({ control })`; they merge by name across `serviceDiscovery: 'merge'` layers, so a local merge layer keeps inherited routes such as `analytics`.
  
  Refs: equinor/fusion-core-tasks#2181
- efdf820: Receive, record, and seed analytics with a mock Fusion Monitor service.
  
  `defineAnalyticsMock()` from `@equinor/fusion-openapi-mock-server/presets/fusion` serves `POST /v1/logs` under the `monitor` service key, where the framework analytics adapter sends its events, and answers like the real Monitor service (`202`, `400`, `401`, `415`). Accepted events:
  
  - get the sender's `user.id`, as in production;
  - are read the way Fusion's analytics pipeline reads them and can be read right away from `definition.store` (`getRows`, `getRecords`);
  - are kept per mock-auth browser session, so parallel tests do not see each other's events. A browser using the framework MSAL mock's startup identity is accepted as the `local-development` session;
  - are appended to an optional JSON Lines recording (`record`), one entry per line in the landing-zone format.
  
  Earlier recordings, gzipped `logs_*.json.gz` landing-zone files, or folders of them can be loaded at start with `seed`. Seeded events are shared by every session and survive a mock server reset, which removes only received events.
  
  ```ts
  // mocks/monitor.mock.ts
  import { defineAnalyticsMock } from '@equinor/fusion-openapi-mock-server/presets/fusion';
  
  export default defineAnalyticsMock({
    record: '.fusion/analytics.jsonl',
    seed: ['recordings/analytics.jsonl'],
  });
  ```
  
  Middleware routes now answer `400` with an `InvalidJson` error when a body declared as JSON (or sent without a `content-type`) is not valid JSON, instead of failing with `500`. A body declared with another `content-type` that is not JSON reaches the route as `body: undefined`, so the route can answer it, for example with `415`.
  
  Refs: equinor/fusion-core-tasks#2179
- efdf820: Read Fusion analytics the way Fusion's analytics pipeline does.
  
  `@equinor/fusion-openapi-mock-server/presets/fusion` now exports:
  
  - `parseOtlpLogsRequest(body, options)` — reads a `POST /v1/logs` body, as sent by the framework analytics adapter, into analytics records.
  - `parseOtlpResourceLog(entry, options)` — reads one `resourceLogs` entry, which is one line of a recording or of a Fusion analytics landing-zone file.
  - `projectAnalyticsEvent(record)` — turns a record into its event table row. `app-feature` events (from `useTrackFeature`) get the same columns the Apps service returns from `POST /apps/feature-events/query`: `data_feature`, `data_body_data`, `data_appkey`, and `data_context_*`.
  - `toAnalyticsTableName(eventName)` — the event table a record belongs to, such as `event_app_feature`.
  
  Values, JSON formatting, and timestamps match production. Parts of a payload that cannot be read are reported in `issues` and skipped; the rest are still returned.
  
  ```ts
  import { parseOtlpLogsRequest, projectAnalyticsEvent } from '@equinor/fusion-openapi-mock-server/presets/fusion';
  
  const { records } = parseOtlpLogsRequest(body, { sourceFile: 'mock' });
  const features = records.map(projectAnalyticsEvent).filter((row) => row?.event_name === 'app-feature');
  ```
  
  Refs: equinor/fusion-core-tasks#2178
- efdf820: Answer the app-feature events query from local analytics.
  
  `defineAppFeatureEventsMock({ store })` from `@equinor/fusion-openapi-mock-server/presets/fusion` adds the Apps service's `POST /apps/feature-events/query` to the Fusion preset's `apps` mock. It answers with the app-feature events the mock Monitor service (`defineAnalyticsMock`) received in the caller's browser session, plus any seeded history. Analytics pages that read usage data can now show real local events instead of hand-written samples.
  
  Queries run against Fabric's `event_app_features` GraphQL schema with the same behavior as production:
  
  - every filter operator (`eq`, `neq`, `contains`, `notContains`, `startsWith`, `endsWith`, `in`, `isNull`, `gt`, `gte`, `lt`, `lte`, `and`, `or`), using SQL null semantics;
  - `orderBy`, variables, operation names, and introspection;
  - `first` (default 100, `-1` for all, at most 100 000) and cursor paging with `after`, `endCursor`, and `hasNextPage`;
  - errors are returned in the GraphQL `errors` list with HTTP 200.
  
  The endpoint answers `401` without a signed-in user. It allows every signed-in user unless an `isAppAdmin` rule is given, in which case other users get `403`.
  
  ```ts
  // mocks/analytics.ts — shared by monitor.mock.ts and apps.mock.ts
  export const monitor = defineAnalyticsMock({ seed: 'recordings' });
  
  // mocks/apps.mock.ts
  export default defineAppFeatureEventsMock({ store: monitor.store });
  ```
  
  `executeAppFeatureEventsQuery(rows, request)` runs the same query engine directly, for example in Vitest.
  
  Refs: equinor/fusion-core-tasks#2180
- 9258fb1: Add `defineHelpArticlesMock` and `readHelpArticles` to `@equinor/fusion-openapi-mock-server/presets/fusion`. `defineHelpArticlesMock({ dir })` serves local help article markdown files (the frontmatter files `fhelp` syncs to Fusion Help) as a mock `help` service with the Help API's article read routes: `GET /articles`, `GET /articles/{articleIdentifier}`, `GET /apps/{appKey}/articles`, and `GET /apps/{appKey}/articles/{articleIdentifier}`. It also serves FAQs (`fhelp` FAQ files with `slug` and `question` frontmatter, read from a `faqs` subfolder) on `GET /faqs`, `GET /faqs/{faqIdentifier}` and the app-scoped variants, exported as `readHelpFaqs`. `POST /search` is a simple term search over articles and FAQs that returns the Help API's `{ '@odata.count', value }` shape, with the Help index content types `type: 'Article' | 'FAQ'`; it is exported as `searchHelpDocs`. Articles are looked up by slug or a stable slug-derived UUID, and `lastModified` comes from the file's modification time. Files are re-read on every request so edits show up without a restart, and unknown slugs return a `404` Fusion API error. Markdown without `slug` and `title` frontmatter, and release notes (`publishedDate`), are not served as articles.
  
  ```typescript
  import { defineHelpArticlesMock } from '@equinor/fusion-openapi-mock-server/presets/fusion';
  
  server.use([defineHelpArticlesMock({ dir: './docs' })]);
  ```
  
  Refs: https://github.com/equinor/fusion-core-tasks/issues/2152

### Patch Changes

- efdf820: Add the "Test analytics locally" guide (`docs/testing-analytics.md`). It covers how analytics flow from `useTrackFeature()` through the dev portal to `ffc mock-server` compared with production, recording and seeding options, checking tracked features in Playwright with `createMockAnalytics`, reading usage data through the app-feature events query, the event columns, differences from production, programmatic use, a route reference, and troubleshooting. The Playwright guide's route reference now lists `/@fusion-mock/analytics`.
  
  Refs: https://github.com/equinor/fusion-core-tasks/issues/2184
- 9258fb1: Fix `serviceDiscovery: 'merge'` layers dropping the earlier layer's middleware. A merge layer's `middleware` routes are now checked first, and the earlier service's routes still handle every request the merge layer does not register, as documented. Previously, any merge layer with middleware replaced the whole earlier router, so adding one custom route removed all inherited routes (for example the Roles V2 or local help docs handlers). When both layers define a `reset` hook, a server reset now runs both (earliest layer first), so state used by inherited routes no longer leaks between tests. The new `composeRouters` helper in `@equinor/fusion-openapi-mock-server/discovery` implements this layering.

## 0.4.0

### Minor Changes

- 4b3a9a0: Add parameterized middleware routes with decoded path parameters, parsed service-relative URLs and queries, and explicit mock-only identity states sourced from session-scoped mock-auth bearer tokens.
  
  Refs: https://github.com/equinor/fusion-core-tasks/issues/2098
- e6b881a: Add `defineRolesV2Mock` for typed, persona-aware Roles V2 HTTP mocks with paged checks, activation/deactivation, recovery behavior, identity switching, and browser-session/account isolation.
  
  Refs: https://github.com/equinor/fusion-core-tasks/issues/2100

### Patch Changes

- 43bc1f0: Add an end-to-end Roles V2 adoption guide covering production configuration, active-only and claim-capable React flows, component tests, persona-aware HTTP mocks, Playwright identity, recovery failures, and trusted backend authorization boundaries.
  
  Refs https://github.com/equinor/fusion-core-tasks/issues/2102
- e6b881a: Align the bundled Roles V2 preset with the read and activation operations used by `@equinor/fusion-framework-module-roles`, and add a repeatable snapshot update command backed by the published Roles service contract.
  
  Fixes https://github.com/equinor/fusion-core-tasks/issues/2099

## 0.3.0

### Minor Changes

- c1924f9: Add a test-runner-agnostic mock-auth helper and session-isolated user API that issues unsigned OBO-style tokens for Fusion MSAL scope requests without restarting test servers. Credentialed browser access allows canonical loopback origins on every port; other origins require an explicit exact-origin allowlist.
  
  Relates to equinor/fusion-core-tasks#2096

## 0.2.1

### Patch Changes

- cc65bd5: Preserve the requested context ID in responses from the bundled Fusion Context preset.
  
  Fixes #5606.

## 0.2.0

### Minor Changes

- 54d0d20: Add `patch` and `options` middleware router shorthands for mocking PATCH and OPTIONS requests.

## 0.1.1

### Patch Changes

- d04e564: Internal: restrict published package contents to compiled distribution files and required runtime artifacts so editor tooling does not load workspace TypeScript configurations from dependencies.

## 0.1.0

### Minor Changes

- f663b46: Add a standalone OpenAPI mock server for local development and end-to-end tests.
  
  The package provides the `createMockServer` API and `fusion-mock` CLI, with directory discovery,
  the bundled Fusion service preset, executable `<name>.mock.ts` modules defined with `defineService`,
  programmable routes and middleware, browser CORS support, deterministic server-level seeding, and
  an HTTP control plane for per-test overrides and resets. Service definitions can be direct-only,
  merge an existing discovery service, add a new service with collision protection, or replace one.

### Patch Changes

- Updated dependencies [f663b46]
  - @equinor/fusion-openapi-mock@0.2.0
