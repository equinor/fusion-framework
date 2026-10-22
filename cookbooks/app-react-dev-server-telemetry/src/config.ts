import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import type { ITelemetryProvider } from '@equinor/fusion-framework-module-telemetry';
import { createHttpTelemetry } from '@equinor/fusion-framework-module-telemetry/integrations';
import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';

/**
 * Configures no exporter. The dev server exports browser telemetry to the endpoint in
 * `FUSION_DEV_SERVER_OTLP_ENDPOINT`; the app host already captures its own startup, and the
 * framework relays app records to the portal.
 *
 * Opening the app with `?fail-startup` throws here, before modules initialize, so the collector
 * shows how an app host reports a failed startup to the portal without any telemetry provider.
 */
export const configure: AppModuleInitiator = (configurator, { env }) => {
  // Opt-in failure demo; a real app would surface its own configuration errors here.
  if (new URLSearchParams(window.location.search).has('fail-startup')) {
    throw new Error('Cookbook startup failure');
  }

  // The router navigates through this module, which connects to the app telemetry by itself.
  enableNavigation(configurator, env.basename);

  // The integration looks telemetry up lazily, so HTTP never waits for telemetry to initialize.
  let telemetry: ITelemetryProvider | undefined;
  const httpTelemetry = createHttpTelemetry(() => telemetry);
  configurator.configureHttpClient('cookbook', {
    baseUri: window.location.origin,
    onCreate: (client) => {
      client.middlewareHandler.use(httpTelemetry.middleware);
    },
  });
  // The plugin hands over the initialized provider, and its teardown detaches HTTP telemetry.
  configurator.registerPlugin(({ modules }) => {
    telemetry = (modules as { telemetry?: ITelemetryProvider }).telemetry;
    return httpTelemetry.dispose;
  });
};

export default configure;
