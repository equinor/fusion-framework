---
"@equinor/fusion-openapi-mock-server": minor
---

Receive, record, and seed analytics with a mock Fusion Monitor service.

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

Middleware routes now answer `400` with an `InvalidJson` error when the request body is not valid JSON, instead of failing with `500`.

Refs: equinor/fusion-core-tasks#2179
