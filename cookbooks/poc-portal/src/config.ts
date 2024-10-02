import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';

export const configure: AppModuleInitiator = (configurator, env) => {
    /** print render environment arguments */
    console.log('configuring application', env);

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
