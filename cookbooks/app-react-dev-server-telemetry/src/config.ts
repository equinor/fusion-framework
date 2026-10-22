import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';

/**
 * Intentionally configures no telemetry. The dev server exports browser telemetry to the endpoint
 * in `FUSION_DEV_SERVER_OTLP_ENDPOINT`, so the app needs no adapter or exporter of its own.
 */
export const configure: AppModuleInitiator = () => {};

export default configure;
