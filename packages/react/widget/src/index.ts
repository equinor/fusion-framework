/**
 * [[include:react-app/README.MD]]
 * @module
 */
export { WidgetModuleInitiator } from '@equinor/fusion-framework-widget';
export { enableWidgetModule } from '@equinor/fusion-framework-module-widget';
export type {
    WidgetModule,
    WidgetRenderArgs,
    WidgetStateInitial,
} from '@equinor/fusion-framework-module-widget';
export { Widget } from './components/Widget';
export { Widget as default } from './components/Widget';
export { makeWidgetComponent } from './util/make-widget-component';
