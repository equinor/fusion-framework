import type { FrameworkConfigurator } from '@equinor/fusion-framework';
import { enableAnalytics } from '@equinor/fusion-framework-module-analytics';
import {
  ConsoleAnalyticsAdapter,
  FusionAnalyticsAdapter,
} from '@equinor/fusion-framework-module-analytics/adapters';
import {
  AppLoadedCollector,
  AppSelectedCollector,
  ContextSelectedCollector,
} from '@equinor/fusion-framework-module-analytics/collectors';
import { FusionOTLPLogExporter } from '@equinor/fusion-framework-module-analytics/logExporters';

/** Portal id sent with analytics, matching the dev portal's context-navigation portal name. */
const PORTAL_ID = 'dev-portal';

/** Service-discovery key of the Fusion Monitor service, which receives analytics. */
const MONITOR_SERVICE_KEY = 'monitor';

/** Options for {@link configureAnalytics}. */
export interface ConfigureAnalyticsOptions {
  /**
   * Origin of the local mock server, when the dev portal runs with `--mock`. Only then are
   * analytics sent, to the mock Monitor service. See `resolveMockServerUrl`.
   */
  mockServerUrl?: string;
}

/**
 * Configures analytics in the dev portal the way the Fusion portal does, so apps can check the
 * analytics they track during local development and in mocked end-to-end tests.
 *
 * @remarks
 * Always registers the portal's collectors (`app-loaded`, `app-selected`, `context-selected`) and
 * the console adapter, which logs events when the `fusionLogAnalytics` feature flag is on.
 *
 * In mock mode ({@link ConfigureAnalyticsOptions.mockServerUrl} set) it also registers the `fusion`
 * adapter, which sends analytics to the `monitor` service in service discovery — the mock Monitor
 * service served by `ffc mock-server` — exactly as the production portal sends them. Outside mock
 * mode no analytics leave the browser, because the discovered `monitor` would be the real service.
 * When the mock server does not serve analytics (`--no-analytics`), a warning is logged and the
 * portal starts without the adapter.
 *
 * @param config - The dev portal's framework configurator.
 * @param options - Mock-mode settings.
 *
 * @example
 * ```ts
 * configureAnalytics(config, { mockServerUrl: resolveMockServerUrl() });
 * ```
 */
export function configureAnalytics(
  config: FrameworkConfigurator,
  options: ConfigureAnalyticsOptions = {},
): void {
  enableAnalytics(config, (builder) => {
    builder.setAdapter('console', async (args) => {
      // Only resolve the feature-flag-gated adapter when the featureFlag module is enabled
      if (args.hasModule('featureFlag')) {
        const featureFlagProvider = await args.requireInstance('featureFlag');
        // Only log analytics to the console when the feature flag is explicitly enabled
        if (featureFlagProvider.getFeature('fusionLogAnalytics')?.enabled) {
          return new ConsoleAnalyticsAdapter();
        }
      }
    });

    // Real service discovery advertises the real Monitor service, so only mock mode sends analytics.
    if (options.mockServerUrl) {
      builder.setAdapter('fusion', async (args) => {
        try {
          const serviceDiscovery = await args.requireInstance('serviceDiscovery');
          const httpClient = await serviceDiscovery.createClient(MONITOR_SERVICE_KEY);
          return new FusionAnalyticsAdapter({
            portalId: PORTAL_ID,
            logExporter: new FusionOTLPLogExporter(httpClient),
          });
        } catch (error) {
          // A failing adapter would stop the whole portal, so start without sending analytics.
          console.warn(
            `Analytics are not sent: the mock server at ${options.mockServerUrl} serves no "${MONITOR_SERVICE_KEY}" service.`,
            error,
          );
          return undefined;
        }
      });
    }

    builder.setCollector('context-selected', async (args) => {
      const contextProvider = await args.requireInstance('context');
      const appProvider = await args.requireInstance('app');
      return new ContextSelectedCollector(contextProvider, appProvider);
    });

    builder.setCollector('app-selected', async (args) => {
      const appProvider = await args.requireInstance('app');
      return new AppSelectedCollector(appProvider);
    });

    builder.setCollector('app-loaded', async (args) => {
      const eventProvider = await args.requireInstance('event');
      const appProvider = await args.requireInstance('app');
      return new AppLoadedCollector(eventProvider, appProvider);
    });
  });
}

export default configureAnalytics;
