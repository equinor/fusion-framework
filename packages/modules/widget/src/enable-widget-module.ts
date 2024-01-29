import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module } from './module';
import { WidgetModuleConfigBuilderCallback } from './WidgetModuleConfigurator';

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
            builder && builder(widgetConfigurator);
        },
    });
};
