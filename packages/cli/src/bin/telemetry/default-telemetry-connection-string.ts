/**
 * Connection string of the approved `appi-fcore-hostenv-all-cli` Application Insights resource.
 *
 * It routes CLI telemetry to its destination and is not a credential; it is embedded so telemetry
 * works without setup, as decided in equinor/fusion-core-tasks#2285.
 * Override it with `FUSION_CLI_TELEMETRY_CONNECTION_STRING`.
 */
export const DEFAULT_TELEMETRY_CONNECTION_STRING =
  'InstrumentationKey=55ea24bf-2f99-4c40-acc6-48cb46614745;IngestionEndpoint=https://norwayeast-0.in.applicationinsights.azure.com/;LiveEndpoint=https://norwayeast.livediagnostics.monitor.azure.com/;ApplicationId=1ac0a15d-9bf3-4ef8-866a-23e0356b6d6e';
