import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import {
  AllCommunityModule,
  ModuleRegistry,
} from '@equinor/fusion-framework-react-ag-charts/community';

// Register AG Charts modules once at initialization
ModuleRegistry.registerModules([AllCommunityModule]);

export const configure: AppModuleInitiator = (configurator, args) => {
  const { basename } = args.env;

  enableNavigation(configurator, basename);

  /** callback when configurations is created */
  configurator.onConfigured((config) => {
    console.log('application config created', config);
  });

  /** callback when the application modules has initialized */
  configurator.onInitialized((instance) => {
    console.log('application config initialized', instance);
  });
};

export default configure;
