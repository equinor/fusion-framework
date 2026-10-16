import type { AppScriptModule } from '@equinor/fusion-framework-module-app';
import { enableAppNavigation } from '../../navigation';
import { renderApp as render } from '../../render-app';
import { RouterApp } from './apploader-router-probe';

// a real app entry point: startup only calls `enableAppNavigation`, no basename copying
export const renderApp: AppScriptModule['renderApp'] = (el, args) =>
  render(RouterApp, (configurator) => enableAppNavigation(configurator, args.env ?? {}))(el, args);
