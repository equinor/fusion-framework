import { enableAppModule } from '@equinor/fusion-framework-module-app';
import { enableBookmark } from '@equinor/fusion-framework-react-module-bookmark';
import type { FrameworkConfigurator } from '@equinor/fusion-framework';
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import { enableServices } from '@equinor/fusion-framework-module-services';
import { enableFeatureFlagging } from '@equinor/fusion-framework-module-feature-flag';
import {
  createLocalStoragePlugin,
  createUrlPlugin,
} from '@equinor/fusion-framework-module-feature-flag/plugins';

import { enableTelemetry } from '@equinor/fusion-framework-module-telemetry';
import { version } from './version';

export const configure = async (config: FrameworkConfigurator) => {
  enableTelemetry(config, {
    attachConfiguratorEvents: true,
    configure: (builder, ref) => {
      builder.setMetadata(() => ({
        fusion: {
          type: 'portal-telemetry',
          portal: {
            version,
            name: 'Fusion Dev Portal',
          },
        },
      }));
      builder.setDefaultScope(['portal']);
      builder.setParent(ref.telemetry);
    },
  });

  enableAppModule(config);

  enableNavigation(config);

  enableServices(config);

  enableBookmark(config, (builder) => {
    builder.setSourceSystem({
      subSystem: 'CLI',
      identifier: 'fusion-cli',
      name: 'Fusion CLI',
    });
  });

  /* Adds demo portal features to cli */
  enableFeatureFlagging(config, (builder) => {
    builder.addPlugin(
      createLocalStoragePlugin([
        {
          key: 'fusionDebug',
          title: 'Fusion debug log',
          description: 'Show Fusion debug log in console',
        },
        {
          key: 'pinkBg',
          title: 'Use pink bg?',
          description: 'When enabled the background should be pink',
        },
      ]),
    );
    builder.addPlugin(createUrlPlugin(['fusionDebug']));
  });

  config.onInitialized(async (modules) => {
    // @ts-ignore
    window.Fusion = { modules };
  });
};

export default configure;
