---
"@equinor/fusion-openapi-mock-server": minor
---

Read Fusion analytics the way Fusion's analytics pipeline does.

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
