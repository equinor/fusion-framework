---
"@equinor/fusion-openapi-mock-server": minor
---

Answer the app-feature events query from local analytics.

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
