import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module } from './module';
import type { WidgetModuleConfigBuilderCallback } from './WidgetModuleConfigurator';

/**
 * Method for enabling the widget module
 * @param configurator - configuration object
 */
export const enableWidgetModule = (
    // biome-ignore  lint/suspicious/noExplicitAny: allowed in this case
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
