import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module } from './module';
import type { WidgetModuleConfigBuilderCallback } from './WidgetModuleConfigurator';

/**
 * Registers the widget module on a Fusion Framework configurator.
 *
 * Call this during framework setup to enable widget loading, manifest
 * resolution, and script import capabilities.
 *
 * @param configurator - The framework modules configurator to register the
 *   widget module on.
 * @param builder - Optional callback to customize the
 *   {@link WidgetModuleConfigurator} (e.g., set a custom HTTP client).
 *
 * @example
 * ```typescript
 * import { enableWidgetModule } from '@equinor/fusion-framework-module-widget';
 *
 * enableWidgetModule(configurator);
 * ```
 */
export const enableWidgetModule = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configurator: IModulesConfigurator<any, any>,
  builder?: WidgetModuleConfigBuilderCallback,
): void => {
  configurator.addConfig({
    module,
    configure: (widgetConfigurator) => {
      builder?.(widgetConfigurator);
    },
  });
};
