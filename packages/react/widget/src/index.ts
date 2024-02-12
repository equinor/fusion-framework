/**
 * [[include:react-app/README.MD]]
 * @module
 */
export { WidgetModuleInitiator } from '@equinor/fusion-framework-widget';
export { enableWidgetModule } from '@equinor/fusion-framework-module-widget';
export type {
    WidgetProps,
    WidgetModule,
    WidgetRenderArgs,
    WidgetStateInitial,
} from '@equinor/fusion-framework-module-widget';
export { BaseWidget } from './components/BaseWidget';
export { Widget } from './components/WidgetComponent';
export { Widget as default } from './components/WidgetComponent';
export { makeWidgetComponent } from './util/make-widget-component';
