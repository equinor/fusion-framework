import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableBookmark } from '@equinor/fusion-framework-module-bookmark';

export const configure: AppModuleInitiator = (configurator) => {
    enableBookmark(configurator);
    configurator.logger.level = 4;

    /** callback when configurations is created */
    // configurator.onConfigured((config) => {
    //     console.log('application config created', config);
    // });

    /** callback when the application modules has initialized */
    // configurator.onInitialized((instance) => {
    //     console.log('application config initialized', instance);
    // });
};

export default configure;
