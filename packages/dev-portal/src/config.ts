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

export const configure = async (config: FrameworkConfigurator) => {
  enableAppModule(config);

  enableNavigation(config);

  enableServices(config);

  enableBookmark(config, (builder) => {
    builder.setSourceSystem({
      subSystem: 'CLI',
      identifier: 'fusion-cli',
      name: 'Fusion CLI',
    });
    // builder.setFilter('application', true);
    // builder.setLogLevel(4);
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

  config.onConfigured(() => {
    console.log('framework config done');
  });

  config.onInitialized(async (modules) => {
    // fusion.auth.defaultClient.setLogger(new ConsoleLogger(0));
    console.debug('📒 subscribing to all events');
    // @ts-ignore
    window.Fusion = { modules };
  });
};

export default configure;
