# Dev server telemetry with Docker Compose and Aspire

This cookbook shows how the Fusion dev server exports telemetry to an OpenTelemetry collector without any telemetry setup in the app. The app in [src/config.ts](./src/config.ts) configures nothing. The app records two events through `modules.telemetry` in [src/App.tsx](./src/App.tsx). When `FUSION_DEV_SERVER_OTLP_ENDPOINT` is set, the dev server forwards those events, and its own browser request spans, to the collector.

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

2. Start the dev server with the collector endpoint. The value is the OTLP/HTTP port of the dashboard:

   ```sh
   FUSION_DEV_SERVER_OTLP_ENDPOINT=http://127.0.0.1:18890 pnpm dev
   ```

3. Open the app URL printed by the dev server, and click the button. The `cookbook_mounted` event is recorded on load, and `cookbook_button_click` on each click.

4. Confirm that the telemetry arrived. The Aspire JSON API serves the data without a token in this unsecured setup:

   ```sh
   curl -s http://127.0.0.1:18888/api/telemetry/resources
   curl -s 'http://127.0.0.1:18888/api/telemetry/logs?limit=5000'
   ```

   The `resources` response includes the `fusion.dev-server` service, and the `logs` response includes `cookbook_mounted` and `cookbook_button_click`. Both events have `source: app` and `fusion.app.key: fusion-framework-cookbook-app-react-dev-server-telemetry` attributes. The logs API is paginated; the larger limit keeps the cookbook events visible among bootstrap records. You can also open the dashboard at `http://127.0.0.1:18888`.

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
- The browser sends OTLP to the dev server's same-origin route, not to the dashboard directly. The dashboard's OTLP/HTTP port sends no CORS headers, so a direct browser request would be blocked.
- Production builds do not include this behavior.
