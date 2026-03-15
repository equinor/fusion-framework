/**
 * Fusion Framework Widget Module
 *
 * Provides runtime loading, configuration, and lifecycle management for
 * remote widget micro-frontends. Widgets are dynamically fetched, imported,
 * and mounted into a host application.
 *
 * @packageDocumentation
 */

export { WidgetModuleConfigurator, type WidgetModuleConfig } from './WidgetModuleConfigurator';

export { WidgetModuleProvider } from './WidgetModuleProvider';

export type { IWidgetModuleProvider } from './WidgetModuleProvider';

export * from './types';

export { enableWidgetModule } from './enable-widget-module';

export { default, type WidgetModule, module, moduleKey } from './module';
