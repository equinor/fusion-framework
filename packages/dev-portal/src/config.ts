import { enableAppModule } from '@equinor/fusion-framework-module-app';
import { enableBookmark } from '@equinor/fusion-framework-react-module-bookmark';
import type { FrameworkConfigurator } from '@equinor/fusion-framework';
import { enableAnalytics } from '@equinor/fusion-framework-module-analytics';
import { ConsoleAnalyticsAdapter } from '@equinor/fusion-framework-module-analytics/adapters';
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import { enableServices } from '@equinor/fusion-framework-module-services';
import { enableFeatureFlagging } from '@equinor/fusion-framework-module-feature-flag';
import {
  createLocalStoragePlugin,
  createUrlPlugin,
} from '@equinor/fusion-framework-module-feature-flag/plugins';
import { enableAgGrid } from '@equinor/fusion-framework-module-ag-grid';

import { enableTelemetry } from '@equinor/fusion-framework-module-telemetry';
import { version } from './version';

declare global {
  interface Window {
    /**
     * AG Grid license key for enabling enterprise features
     * @remarks This is typically set via environment variables during build time
     */
    FUSION_AG_GRID_KEY?: string;
  }
}

/**
 * Configures the Fusion Dev Portal with all required modules and features
 *
 * This function sets up the complete framework configuration including:
 * - Telemetry tracking for portal analytics
 * - Core app functionality and navigation
 * - Bookmark management system
 * - Feature flagging for development features
 * - Service integrations
 *
 * @param config - The framework configurator instance to extend with portal features
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
          portal: {
            version,
            name: 'Fusion Dev Portal',
          },
        },
      }));
      // Scope telemetry events to portal-specific tracking
      builder.setDefaultScope(['portal']);
      // Inherit parent telemetry configuration for consistent tracking
      builder.setParent(ref.telemetry);
    },
  });

  enableAppModule(config);

  enableNavigation(config);

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

  // Expose framework modules globally for development debugging and inspection
  config.onInitialized(async (modules) => {
    // NOTE: TypeScript ignore needed due to window object extension
    // This provides developer access to all initialized modules via window.Fusion
    // @ts-ignore
    window.Fusion = { modules };
  });
};

export default configure;
