/**
 * Fusion Framework Widget Module
 *
 * Provides runtime loading, configuration, and lifecycle management for
 * remote widget micro-frontends. Widgets are dynamically fetched, imported,
 * and mounted into a host application.
 *
 * @packageDocumentation
 */

export { WidgetModuleConfigurator, type WidgetModuleConfig } from './WidgetModuleConfigurator.js';

export { WidgetModuleProvider } from './WidgetModuleProvider.js';

export type { IWidgetModuleProvider } from './WidgetModuleProvider.js';

export * from './types.js';

export { enableWidgetModule } from './enable-widget-module.js';

export { default, type WidgetModule, module, moduleKey } from './module.js';
