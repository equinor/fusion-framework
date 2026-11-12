# Dev server telemetry with Docker Compose and Aspire

This cookbook shows how the Fusion dev server exports telemetry to an OpenTelemetry collector without an exporter in the app. When `FUSION_DEV_SERVER_OTLP_ENDPOINT` is set, the dev server forwards the portal's telemetry, including everything the app relays to it, and its own browser request spans, to the collector.

The app demonstrates each kind of record the framework produces:

- **Host and module lifecycle.** The app host captures its own startup, so every module initialization and the app's startup arrive as `fusion.<module>.initialize.duration` metrics, identified by `fusion.diagnostic.source: app` and the app key as `fusion.diagnostic.hostName`.
- **Custom events.** [src/pages/HomePage.tsx](./src/pages/HomePage.tsx) records `cookbook_mounted` and `cookbook_button_click` through `modules.telemetry`.
- **Navigation.** [src/routes.tsx](./src/routes.tsx) has two routes. The router navigates through the navigation module, which [src/config.ts](./src/config.ts) enables without any telemetry setup; each navigation arrives as a `Navigation::navigated` event without the path or search parameters.
- **HTTP requests.** [src/config.ts](./src/config.ts) adds `createHttpTelemetry` from `@equinor/fusion-framework-module-telemetry/integrations` to the `cookbook` HTTP client. Each request arrives as `fusion.http.request.duration`, and a failed request adds a sanitized `fusion.http.request.failure`, without the URL, headers or body.
- **Startup failure.** Opening the app with `?fail-startup` makes its configuration throw. The app host reports `fusion.host.initialize.failure` to the portal, although the app never created a telemetry provider.

The collector is the standalone Aspire dashboard, started by [docker-compose.yml](./docker-compose.yml). It is unsecured and bound to `127.0.0.1`, and it keeps telemetry in memory only.

For the dev server options, see [packages/dev-server/docs/configuration.md](../../packages/dev-server/docs/configuration.md).

## Prerequisites

- Docker, with Compose v2
- The workspace dependencies installed with `pnpm install` at the repository root

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
   - click **Send HTTP request** and **Send failing HTTP request** to record a successful and a failed request;
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

   Records from the same host share one `fusion.diagnostic.hostId`. The value `never-exported`, which the app puts in navigation and request URLs, appears in no record. The logs API is paginated; the larger limit keeps the cookbook records visible among bootstrap records. You can also open the dashboard at `http://127.0.0.1:18888`.

   Records are batched; allow a few seconds after loading or clicking before querying the API.

5. Stop the dashboard when you are finished. Its telemetry is discarded:

   ```sh
   docker compose down
   ```

## Run in mock mode

Mock mode serves the app without signing in. It needs the mock server and a built dev portal from this workspace.

1. Build the workspace dev portal once. The dev server serves it locally in mock mode, and it is not built in a fresh clone:

   ```sh
   pnpm --filter @equinor/fusion-framework-dev-portal build
   ```

2. Start the Aspire dashboard as in [Run the cookbook](#run-the-cookbook).

3. Start the mock server on port `4010`, which is the default endpoint for `--mock`:

   ```sh
   pnpm --dir ../../packages/utils/openapi-mock-server build
   node ../../packages/utils/openapi-mock-server/dist/esm/cli/index.js --preset=fusion --port 4010
   ```

4. In a second terminal, start the dev server in mock mode. Use `pnpm exec`, because `pnpm dev -- --mock` does not pass the flag through:

   ```sh
   FUSION_DEV_SERVER_OTLP_ENDPOINT=http://127.0.0.1:18890 pnpm exec fusion-framework-cli app dev --mock
   ```

5. Open the app URL from the dev server log and confirm the steps in [Run the cookbook](#run-the-cookbook). The telemetry is the same in both modes.

If the dev portal is not built, the dev server logs `external, skipping` for `@equinor/fusion-framework-dev-portal`, and the app fails to load in mock mode.

## Ports

The dashboard uses `18888` for the UI and JSON API, `18889` for OTLP/gRPC, and `18890` for OTLP/HTTP. Another stack on this machine that uses the same ports, such as a shared telemetry dashboard, blocks `docker compose up`. Stop that stack first.

## Notes

- Without `FUSION_DEV_SERVER_OTLP_ENDPOINT`, the dev server exports nothing, and the app behaves the same.
- The dev portal configures navigation telemetry explicitly, so the portal host also exports `Navigation::action` debug events. The app's navigation is connected automatically, which leaves out those per-action debug events.
- The dev server serves the app page only to requests that accept HTML. The failing request asks for JSON, so the dev server answers `404`.
- The browser sends OTLP to the dev server's same-origin route, not to the dashboard directly. The dashboard's OTLP/HTTP port sends no CORS headers, so a direct browser request would be blocked.
- Production builds do not include this behavior.
