/**
 * `@equinor/fusion-framework-widget` — configure and initialize Fusion widget modules.
 *
 * This package provides the {@link configureWidgetModules} factory and the
 * {@link WidgetConfigurator} class used to set up HTTP clients, MSAL
 * authentication, service-discovery bindings, and custom modules for a
 * Fusion widget.
 *
 * @packageDocumentation
 */

export { WidgetConfigurator, IWidgetConfigurator } from './WidgetConfigurator';

export * from './types';

export { configureWidgetModules, default } from './configure-widget-modules';
