import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';

import { enableContext } from '@equinor/fusion-framework-module-context';
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import { enableBookmark } from '@equinor/fusion-framework-react-app/bookmark';

export const configure: AppModuleInitiator = (configurator, args) => {
  const { basename } = args.env;
  enableNavigation(configurator, basename);

  enableContext(configurator, async (builder) => {
    builder.setContextType(['projectMaster']); // set contextType to match against
  });

  enableBookmark(configurator);

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
