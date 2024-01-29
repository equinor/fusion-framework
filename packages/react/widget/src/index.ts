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
export { Widget } from './components/widget';
export { Widget as default } from './components/widget';
export { makeWidgetComponent } from './util/make-widget-component';
