# Diagnose failed and slow operations with Aspire

This cookbook shows how the Fusion dev server exports telemetry to an OpenTelemetry collector without an exporter in the app. When `FUSION_DEV_SERVER_OTLP_ENDPOINT` is set, the dev server forwards the portal's telemetry, including everything the app relays to it, and its own browser request spans, to the collector.

Use this workflow for startup failures, slow HTTP requests and module outcomes. Docker
is optional: it runs the local dashboard, not the application. Normal development
without export needs neither Docker nor Aspire.

The app demonstrates representative records:

- **Host and module lifecycle.** The app host captures its own startup, so every module initialization and the app's startup arrive as `fusion.<module>.initialize.duration` metrics, identified by `fusion.diagnostic.source: app` and the app key as `fusion.diagnostic.hostName`.
- **Custom events.** [src/pages/HomePage.tsx](./src/pages/HomePage.tsx) records `cookbook_mounted` and `cookbook_button_click` through `modules.telemetry`.
- **Navigation.** [src/routes.tsx](./src/routes.tsx) has two routes. The router navigates through the navigation module, which [src/config.ts](./src/config.ts) enables without any telemetry setup; each navigation arrives as a `Navigation::navigated` event without the path or search parameters.
- **HTTP requests.** [src/config.ts](./src/config.ts) adds `createHttpTelemetry` from `@equinor/fusion-framework-module-telemetry/integrations` to the `cookbook` HTTP client. Each request arrives as `fusion.http.request.duration`, and a failed request adds a sanitized `fusion.http.request.failure`, without the URL, headers or body. [dev-server.config.ts](./dev-server.config.ts) supplies opt-in local fixtures: a `503` failure and a successful response delayed by 1,500 ms before headers.
- **Startup failure.** Opening the app with `?fail-startup` makes its configuration throw. The app host reports `fusion.host.initialize.failure` to the portal, although the app never created a telemetry provider.

The collector is the standalone Aspire dashboard, started by [docker-compose.yml](./docker-compose.yml). It is unsecured and bound to `127.0.0.1`, and it keeps telemetry in memory only.

See [dev-server options](../../packages/dev-server/docs/configuration.md) and the
[coverage, privacy and routing reference](../../packages/modules/telemetry/docs/operational-telemetry.md).

## Prerequisites

- Node 24 or newer and the repository-pinned pnpm (see root `package.json`).
- Docker with Compose v2, **only** for the optional dashboard below. An existing
  OTLP/HTTP collector can be used instead.
- From a clean checkout, install and build dependencies at the repository root:

  ```sh
  pnpm install --frozen-lockfile
  pnpm exec turbo run build --filter=@equinor/fusion-framework-cli... --filter=@equinor/fusion-framework-dev-portal... --filter=@equinor/fusion-openapi-mock-server...
  cd cookbooks/app-react-dev-server-telemetry
  ```

All commands below run from the cookbook folder unless stated otherwise.
The CLI and mock server load built workspace packages; `pnpm install` alone is not
sufficient on a clean checkout.

## Run the cookbook

1. Start the Aspire dashboard from this folder:

   ```sh
   docker compose up -d
   ```

   If another stack already uses the dashboard ports, choose free host ports and use them in the following steps:

   ```sh
   ASPIRE_UI_PORT=28888 ASPIRE_OTLP_GRPC_PORT=28889 ASPIRE_OTLP_HTTP_PORT=28890 docker compose up -d
   ```

2. Start the dev server with the collector endpoint. The value is the OTLP/HTTP port of the dashboard:

   ```sh
   FUSION_DEV_SERVER_OTLP_ENDPOINT=http://127.0.0.1:18890 pnpm dev
   ```

3. Open the app URL printed by the dev server. `cookbook_mounted` and the startup records are recorded on load. Then:

   - click **Send telemetry event** to record `cookbook_button_click`;
   - click **Send HTTP request** to record a successful request;
   - click **Send failing HTTP request**: the UI changes from `loading` to `failure`
     for the local `503` fixture;
   - click **Send slow HTTP request**: the UI stays `loading` for about 1.5 seconds,
     then changes to `success`;
   - follow the **Details** and **Home** links to record navigations;
   - open the app URL with `?fail-startup` appended to record a failed app startup.

4. Confirm that the telemetry arrived. The Aspire JSON API serves the data without a token in this unsecured setup:

   ```sh
   curl -s http://127.0.0.1:18888/api/telemetry/resources
   curl -s 'http://127.0.0.1:18888/api/telemetry/logs?limit=5000'
   ```

   The `resources` response includes the `fusion.dev-server` service. In the `logs` response, expect:

   | Record | Identifying attributes |
   | --- | --- |
   | `fusion.<module>.initialize.duration`, `fusion.host.initialize.duration` | `fusion.diagnostic.source: app`, `fusion.diagnostic.hostName: fusion-framework-cookbook-app-react-dev-server-telemetry`; the portal's own startup has `fusion.diagnostic.source: framework` |
   | `cookbook_mounted`, `cookbook_button_click` | `source: app`, `fusion.app.key: fusion-framework-cookbook-app-react-dev-server-telemetry` |
   | `Navigation::navigated` | One from the app host and one from the portal host, with only `fusion.properties.action` |
   | `fusion.http.request.duration`, `fusion.http.request.failure` | `fusion.diagnostic.outcome: success` or `failure`; the failure is an `OperationalError` with the message `fusion.http.request failed`, never the original error |
   | `fusion.host.initialize.failure` | `fusion.diagnostic.source: app` and `fusion.diagnostic.outcome: failure`, after loading with `?fail-startup` |

   Records from the same host share one `fusion.diagnostic.hostId`. The navigation
   demonstration's query value is absent from built-in operational logs. This guarantee
   does **not** apply to standard browser request spans, which can include URLs.
   Never use real secrets in diagnostic requests. The logs API is paginated: compare
   `returnedCount` with `totalCount` rather than assuming a page is complete.

   Records are batched; allow a few seconds after loading or clicking before querying the API.

5. Follow the [dashboard diagnosis steps](#diagnose-in-aspire-1361), then stop the dev
   server and mock server with Ctrl+C. Stop the dashboard; its telemetry is discarded:

   ```sh
   docker compose down
   ```

## Run in mock mode

Mock mode serves the app without signing in. It needs the mock server and a built dev portal from this workspace.

1. Complete the clean-checkout build in [Prerequisites](#prerequisites).

2. Start the Aspire dashboard as in [Run the cookbook](#run-the-cookbook).

3. Start the mock server on port `4010`, which is the default endpoint for `--mock`:

   ```sh
   node ../../packages/utils/openapi-mock-server/dist/esm/cli/index.js --preset=fusion --port 4010
   ```

4. In a second terminal, start the dev server in mock mode. Use `pnpm exec`, because `pnpm dev -- --mock` does not pass the flag through:

   ```sh
   FUSION_DEV_SERVER_OTLP_ENDPOINT=http://127.0.0.1:18890 pnpm exec fusion-framework-cli app dev --mock http://127.0.0.1:4010 --host 127.0.0.1
   ```

5. Open the app URL from the dev server log and confirm the steps in [Run the cookbook](#run-the-cookbook). The telemetry is the same in both modes.

If the dev portal is not built, the dev server logs `external, skipping` for `@equinor/fusion-framework-dev-portal`, and the app fails to load in mock mode.

## Diagnose in Aspire 13.6.1

These controls were checked against the Compose-pinned standalone dashboard
`mcr.microsoft.com/dotnet/aspire-dashboard:13.6.1`.

1. Open `http://127.0.0.1:18888/structuredlogs`. Under **Resource**, choose
   `fusion.dev-server`. Both app and portal logs use this exporter resource; it is
   not the app name. Keep **Level** at `(All)` so Information duration records remain visible.
2. Use **Add filter**. Set **Parameter** to `fusion.diagnostic.hostName`,
   **Condition** to `contains`, and **Value** to
   `fusion-framework-cookbook-app-react-dev-server-telemetry`; select the suggested
   value (or press Enter), then **Apply filter**. Add filters the same way for
   `fusion.diagnostic.module` = `http` and `fusion.diagnostic.operation` = `request`.
   Custom events use `fusion.app.key` instead of `fusion.diagnostic.hostName`.
3. After clicking the failing button, find `fusion.http.request.failure` at Error
   level. **Exception details** shows `OperationalError: fusion.http.request failed`,
   not the server response or original stack. Open the duration row's details by
   clicking the row; `fusion.diagnostic.outcome` is `failure` and
   `fusion.telemetry.value` is the duration in milliseconds. One failed request emits
   one duration and one exception, not two failed requests.
4. Click the slow button. Find the new `fusion.http.request.duration` row with
   `outcome: success` and `fusion.telemetry.value` about 1,500 ms or greater.
   The delay is server-side before headers, not an artificial telemetry measurement.
   Compare timestamps with the click and the fast request. A slow success is still
   Information; filtering to errors alone hides it.
5. Open **Traces** in the navigation. Select the app's fetch request trace and inspect
   its span duration and HTTP status. The slow fixture has a long fetch span; the failure
   fixture has status `503`. No backend server span is expected: these fixtures are
   local middleware, not an OpenTelemetry-instrumented backend.

The log's **Trace** column links to a trace only when an active span was captured.
Operational measurements do not create spans, and the HTTP integration's log can have
`-` in that column even though the fetch instrumentation exported a request span.
In that case use the app identity, timestamp, request span URL and duration in
**Traces**. `hostId` groups a host lifecycle, not individual requests; temporal proximity
is a diagnostic clue, not proof of parentage. Application-owned global tracer providers
take precedence; their own exporter/context setup determines available request spans.

Fusion duration metrics appear in **Structured logs**, **not Metrics**. Standard
development browser spans can include URL attributes; the operational record
allowlist does not sanitize those third-party instrumentation attributes.

## Send a safe custom event

The **Send telemetry event** button uses the app's existing provider, without an adapter:

```ts
telemetry.trackEvent({
  name: 'cookbook_button_click',
  level: TelemetryLevel.Information,
  scope: [TelemetryScope.Application],
  properties: { source: 'cookbook' },
});
```

`telemetry` is `useAppModule<TelemetryModule>('telemetry')`; the types and enums come
from `@equinor/fusion-framework-module-telemetry`. Keep names and properties static
or explicitly allowlisted. Custom events do not inherit built-in privacy guarantees:
do not attach users, tokens, URLs, request bodies or raw exceptions.

## Disable export, test outages and shut down

Unset `FUSION_DEV_SERVER_OTLP_ENDPOINT` and restart the dev server to disable its
collection routes and injected exporters. A variable stored in an env file must also
be removed. This does not disable an application-owned adapter. The ordinary command
`pnpm dev` works without a dashboard.

To reproduce a collector outage, leave export enabled and run `docker compose stop
telemetry`, then click a request button. Application success/failure remains determined
by the local fixture. Failed export is best effort, with a five-second timeout; the
dev server reports its first delivery error and the browser log exporter warns once.
Restart with `docker compose start telemetry` and generate **new** records. Do not
expect failed batches to be replayed or old in-memory data to survive the restart.

Stop app/mock processes with Ctrl+C before `docker compose down`. Supported provider
disposal awaits exporter shutdown, but closing a tab or stopping a process abruptly
can lose queued browser records. This is not durable storage.

## Troubleshoot missing records

| Symptom | Check |
| --- | --- |
| No resource or data | Set the endpoint in the dev-server process, restart it, reload the app and wait a few seconds. Check the OTLP/HTTP port, not the UI or gRPC port. |
| Requests fail but export works | Check the local fixture under `/@fusion-api/__telemetry-cookbook/failure` (`503`) or `/slow` (`200`, delayed). App sign-in/network failures are separate from exporter errors. |
| Mock app does not load | Complete the prerequisite build; verify `http://127.0.0.1:4010/@fusion-mock/discovery` before starting `--mock`. No real sign-in is needed. |
| App data missing but portal data visible | An explicit app adapter, even a console adapter, suppresses the ancestor dev-server fallback for app records. Filters/metadata alone do not claim ownership. |
| Duration missing in Metrics | Look in Structured logs and keep Information visible; use `fusion.telemetry.value` with `fusion.diagnostic.unit: ms`. |
| Old records or incomplete API results | Remove stale filters/check the time range; compare API `returnedCount` and `totalCount`. Clear/reproduce a small scenario rather than treating a page as full history. |
| Data takes time or disappears under load | Logs/spans batch after about one second, up to 128 per batch and 2,048 queued; queues can drop records. HMR/reloads create new host IDs. |
| No trace link or request spans | No active span means no log correlation. Check the separate Traces view and whether an app-owned tracer provider owns tracing. Not every operation has a span. |
| Port conflict | Use the Compose port overrides below and change both the browser dashboard URL and `FUSION_DEV_SERVER_OTLP_ENDPOINT` accordingly. Do not stop unrelated containers. |

## Ports

The dashboard uses `18888` for the UI and JSON API, `18889` for OTLP/gRPC, and `18890` for OTLP/HTTP. Another stack on this machine that uses the same ports blocks `docker compose up`; choose free host ports using the overrides in [Run the cookbook](#run-the-cookbook).

## Verification evidence

Verified locally on 2026-11-24 with macOS, Node 24.19.0, pnpm 12.23.0 and Aspire
13.6.1. From an initially unbuilt isolated worktree, the prerequisite build and
documented mock-server/dev-server commands loaded the app without a real sign-in.
The verification used app port `3013` (`--port 3013`); dashboard/mock ports were unchanged.

| Check | Observed result |
| --- | --- |
| `docker compose config --quiet` and `docker compose up -d` | Passed; the UI and telemetry API were reachable on loopback. |
| `curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3013/@fusion-api/__telemetry-cookbook/failure` | `503`; clicking the app button produced one failed app duration and one safe exception. |
| `curl -s -o /dev/null -w '%{http_code} %{time_starttransfer}\n' http://127.0.0.1:3013/@fusion-api/__telemetry-cookbook/slow` | `200`, 1.503 seconds to headers; browser duration log 1,504.7 ms and request trace about 1.51 seconds. These are sample observations, not performance guarantees. |
| Dashboard Structured logs | Resource, Add filter parameter/value/apply controls, module filter, row details and sanitized Exception details verified in the UI. |
| Dashboard Traces | Separate fetch traces visible, including the errored request and 1.51-second success; those operational logs had no trace link. |
| `docker compose stop telemetry`, then click slow request | App still reached `success`; dev-server delivery error and first browser warning observed. |
| `docker compose start telemetry`, then send custom event | New `cookbook_button_click` arrived; previous in-memory data was gone. |
| Restart dev server without the endpoint variable | POST to `/@fusion-telemetry/v1/logs` returned `404`; slow fixture still returned `200` in about 1.5 seconds. |

Repository-root checks:

```sh
pnpm --filter @equinor/fusion-framework-cookbook-app-react-dev-server-telemetry exec tsc -b --force
pnpm exec biome lint cookbooks/app-react-dev-server-telemetry
pnpm exec fusion-lint lint cookbooks/app-react-dev-server-telemetry
pnpm test
pnpm build
pnpm lint
pnpm build:docs
```

The cookbook type/convention checks, repository tests (336 files, 3,183 tests passed,
two skipped), all 94 build tasks, lint and documentation build passed. The docs build
reported existing unrelated broken-link/sidebar warnings, none for these new pages.
The clean build reused the local package store; this is not evidence of an offline
or empty-cache install. Real sign-in, a production backend trace, app-owned tracer
provider behavior and abrupt-tab flush were not exercised in this browser session.

## Notes

- Without `FUSION_DEV_SERVER_OTLP_ENDPOINT`, the dev server exports nothing, and the app behaves the same.
- The dev portal configures navigation telemetry explicitly, so the portal host also exports `Navigation::action` debug events. The app's navigation is connected automatically, which leaves out those per-action debug events.
- The dev server serves the app page only to requests that accept HTML. Diagnostic fixture requests ask for JSON and use separate local routes.
- The browser sends OTLP to the dev server's same-origin route, not to the dashboard directly. The dashboard's OTLP/HTTP port sends no CORS headers, so a direct browser request would be blocked.
- Production builds do not include this behavior.
