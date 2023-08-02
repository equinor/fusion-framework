import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import type { WidgetModuleConfigBuilderCallback } from './WidgetModuleConfigBuilder';

import { module } from './module';

/**
 * Method for enabling the widget module
 * @param configurator - configuration object
 */
export const enableWidgetModule = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configurator: IModulesConfigurator<any, any>,
    builder?: WidgetModuleConfigBuilderCallback,
): void => {
    configurator.addConfig({
        module,
        configure: (widgetConfigurator) => {
            builder && widgetConfigurator.addConfigBuilder(builder);
        },
    });
};
