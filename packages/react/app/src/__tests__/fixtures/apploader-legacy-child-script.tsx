import type { AppScriptModule } from '@equinor/fusion-framework-module-app';
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import { renderApp as render } from '../../render-app';
import { RouterApp } from './apploader-router-probe';

// legacy startup: copies the bare `env.basename` into the navigation module
export const renderApp: AppScriptModule['renderApp'] = (el, args) =>
  render(RouterApp, (configurator) => enableNavigation(configurator, args.env?.basename))(el, args);
