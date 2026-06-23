import { enableAppModule, type AppModule } from '@equinor/fusion-framework-module-app';
import { enableBookmark } from '@equinor/fusion-framework-react-module-bookmark';
import type { FrameworkConfigurator } from '@equinor/fusion-framework';
import { enableAnalytics } from '@equinor/fusion-framework-module-analytics';
import { ConsoleAnalyticsAdapter } from '@equinor/fusion-framework-module-analytics/adapters';
import { enableContext } from '@equinor/fusion-framework-module-context';
import {
  enableNavigation,
  type NavigationModule,
} from '@equinor/fusion-framework-module-navigation';
import { enableServices } from '@equinor/fusion-framework-module-services';
import { enableFeatureFlagging } from '@equinor/fusion-framework-module-feature-flag';
import {
  createLocalStoragePlugin,
  createUrlPlugin,
} from '@equinor/fusion-framework-module-feature-flag/plugins';
import { enableAgGrid } from '@equinor/fusion-framework-module-ag-grid';
import { enableTelemetry } from '@equinor/fusion-framework-module-telemetry';
import {
  enableContextNavigation,
  enableLegacyAppNavigationFix,
} from '@equinor/fusion-framework-plugin-context-navigation';
import {
  buildContextUrlForStrategy,
  resolveContextIdFromUrl,
} from '@equinor/fusion-framework-plugin-context-navigation/utils';
import { version } from './version';

declare global {
  interface Window {
    /**
     * AG Grid license key for enabling enterprise features.
     * @remarks Typically set via environment variables during build time.
     */
    FUSION_AG_GRID_KEY?: string;
  }
}

/**
 * Configures the Fusion Dev Portal framework with all required modules.
 *
 * Modules enabled:
 * - **Telemetry** — portal-scoped usage analytics with version metadata.
 * - **App** — application manifest loading and lifecycle.
 * - **Context** — context routing URL hooks (path generator + extractor) wired to the shared context-navigation URL utilities.
 * - **Context Navigation plugin** — keeps the browser URL in sync with the
 *   active context, handles app-switch carry-over, and guards against
 *   accidental context loss. Telemetry is auto-resolved from the framework
 *   telemetry module.
 * - **Navigation** — router integration with telemetry.
 * - **Services** — standard Fusion service integrations.
 * - **AG Grid** — enterprise license key from `window.FUSION_AG_GRID_KEY`.
 * - **Analytics** — console adapter gated by the `fusionLogAnalytics` feature flag.
 * - **Bookmarks** — source-system metadata identifying CLI-created bookmarks.
 * - **Feature flags** — local-storage and URL-based flag plugins for dev toggles.
 *
 * On initialization, exposes all modules on `window.Fusion` for debugging.
 *
 * @param config - The framework configurator instance to extend with portal modules.
 */
export const configure = async (config: FrameworkConfigurator) => {
  // Enable telemetry tracking for portal usage analytics and monitoring
  enableTelemetry(config, {
    attachConfiguratorEvents: true,
    configure: (builder, ref) => {
      // Set metadata identifying this as portal telemetry with version info
      builder.setMetadata(() => ({
        fusion: {
          type: 'portal-telemetry',
          portal: { version, name: 'Fusion Dev Portal' },
        },
      }));
      // Scope telemetry events to portal-specific tracking
      builder.setDefaultScope(['portal']);
      // Inherit parent telemetry configuration for consistent tracking
      builder.setParent(ref.telemetry);
    },
  });

  enableAppModule(config);

  /**
   * Configure context module with dev-portal URL conventions.
   *
   * This wires the context module's URL hooks — the path generator
   * and path extractor — to the dev-portal's URL routing strategy.
   *
   * The context-navigation plugin keeps the browser URL in sync with the
   * active context as it changes at runtime.
   */
  enableContext(config, (builder) => {
    builder.setContextPathGenerator((context, path) =>
      buildContextUrlForStrategy(context?.id, path),
    );

    builder.setContextPathExtractor((path) => resolveContextIdFromUrl(path));
  });

  enableNavigation(config, {
    configure: (navConfig) => {
      navConfig.setBasename('/');
      navConfig.setTelemetry(async (args) => {
        if (args.hasModule('telemetry')) {
          return await args.requireInstance('telemetry');
        }
      });
    },
  });

  enableServices(config);

  // Configure AG Grid with license key from environment if provided
  enableAgGrid(config, (builder) => {
    builder.setLicenseKey(window.FUSION_AG_GRID_KEY);
  });

  enableAnalytics(config, (builder) => {
    builder.setAdapter('console', async (args) => {
      if (args.hasModule('featureFlag')) {
        const featureFlagProvider = await args.requireInstance('featureFlag');
        if (featureFlagProvider.getFeature('fusionLogAnalytics')?.enabled) {
          return new ConsoleAnalyticsAdapter();
        }
      }
    });
  });

  // Configure bookmark functionality with CLI as the source system
  enableBookmark(config, (builder) => {
    // Identify bookmarks created in dev portal as coming from CLI system
    builder.setSourceSystem({
      subSystem: 'CLI',
      identifier: 'fusion-cli',
      name: 'Fusion CLI',
    });
  });

  // Configure feature flags for development and demo purposes
  enableFeatureFlagging(config, (builder) => {
    // Add local storage plugin for persistent feature flag storage
    builder.addPlugin(
      createLocalStoragePlugin([
        {
          key: 'fusionDebug',
          title: 'Fusion debug log',
          description: 'Show Fusion debug log in console',
        },
        {
          key: 'fusionLogAnalytics',
          title: 'Log Fusion Analytics',
          description: 'Show Analytics events in console',
        },
        {
          key: 'pinkBg',
          title: 'Use pink bg?',
          description: 'When enabled the background should be pink',
        },
      ]),
    );
    // Add URL plugin to allow enabling debug features via query parameters
    builder.addPlugin(createUrlPlugin(['fusionDebug']));
  });

  // Keep portal URLs aligned with the active app/context combination by using
  // the shared context-navigation plugin and the dev-portal URL helpers.
  enableContextNavigation(config, (builder) => {
    builder.setPortalName('dev-portal');
    builder.setDebug(true);
    builder.setUrlGuard(true);
    builder.setNavigationOptions({
      replace: false, // Use pushState for navigation to allow back button support
    });
  });

  config.onInitialized<[AppModule, NavigationModule]>((modules) => {
    // Reset legacy app routers on context navigation for apps with navigation <v7.
    enableLegacyAppNavigationFix({ event: modules.event });

    // Expose framework modules globally for development debugging and inspection.
    // @ts-expect-error — `window` is not typed with `Fusion`
    window.Fusion = { modules };
  });
};
