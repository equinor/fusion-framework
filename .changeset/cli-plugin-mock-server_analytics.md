---
"@equinor/fusion-framework-cli-plugin-mock-server": minor
---

`ffc mock-server` now receives and records the analytics your app sends.

By default the command serves a mock `monitor` service that receives analytics and reads them the way Fusion's analytics pipeline does. It also answers the Apps service's `POST /apps/feature-events/query` with them, so analytics pages show your own local usage. Every batch is appended to `.fusion-mock/analytics.jsonl`; the folder gets a `.gitignore` so recordings are not committed by accident.

New options, also available as `mockServer.analytics` in `dev-server.config.ts` and as `analytics` in `mockServerPlugin()`:

- `--analytics-record <file>` or `--no-analytics-record`: choose the recording file, or keep events in memory only.
- `--analytics-seed <path>` (repeatable): load earlier recordings, `logs_*.json.gz` landing-zone files, or folders of them at start.
- `--no-analytics`: turn analytics off.

The startup log shows where analytics are recorded and how many seeded events were loaded. A seed path that cannot be read stops startup.

Refs: equinor/fusion-core-tasks#2181
