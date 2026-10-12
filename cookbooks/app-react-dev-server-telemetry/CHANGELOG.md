# @equinor/fusion-framework-cookbook-app-react-dev-server-telemetry

## 0.0.1

### Patch Changes

- 78aa819: Add a cookbook that shows the dev server exporting telemetry to a local Aspire dashboard through Docker Compose. The app configures no telemetry and records two events through `modules.telemetry`. Set `FUSION_DEV_SERVER_OTLP_ENDPOINT` to the dashboard's OTLP/HTTP port and follow the README to verify the events in the dashboard's JSON API.
  
  Ref: equinor/fusion-core-tasks#2241.
