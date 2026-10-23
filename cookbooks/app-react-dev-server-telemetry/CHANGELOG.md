# @equinor/fusion-framework-cookbook-app-react-dev-server-telemetry

## 0.0.3-next.0

### Patch Changes

- e98f6ec: Demonstrate operational telemetry end to end against the Aspire dashboard: app host
  lifecycle records, router navigation, HTTP request outcomes through
  `createHttpTelemetry`, and an opt-in failed startup with `?fail-startup`. The README
  lists the records to expect and shows that URLs never reach the collector. The Docker
  Compose ports can be overridden with `ASPIRE_UI_PORT`, `ASPIRE_OTLP_GRPC_PORT` and
  `ASPIRE_OTLP_HTTP_PORT`.
  
  Ref: #5803.

## 0.0.2

### Patch Changes

- 79014cd: Internal: centralize direct React runtime and type dependencies in a shared workspace
  catalog. Pin React and React DOM to the same 19.3.1 runtime version to prevent
  incompatible resolutions. Consumer-facing peer dependency ranges are unchanged.

## 0.0.1

### Patch Changes

- 78aa819: Add a cookbook that shows the dev server exporting telemetry to a local Aspire dashboard through Docker Compose. The app configures no telemetry and records two events through `modules.telemetry`. Set `FUSION_DEV_SERVER_OTLP_ENDPOINT` to the dashboard's OTLP/HTTP port and follow the README to verify the events in the dashboard's JSON API.
  
  Ref: equinor/fusion-core-tasks#2241.
