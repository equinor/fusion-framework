import { WidgetModuleInitiator, enableWidgetModule } from '@equinor/fusion-framework-react-widget';

export const configure: WidgetModuleInitiator = (configurator, env) => {
    /** print render environment arguments */
    console.log('configuring application', env);
    configurator.useFrameworkServiceClient('apps');
    enableWidgetModule(configurator);

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
