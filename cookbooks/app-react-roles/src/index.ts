import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { type ComponentRenderArgs, makeComponent } from '@equinor/fusion-framework-react-app';
import { RolesProvider } from '@equinor/fusion-framework-react-components-roles';

import App from './App';
import configure from './config';

const appComponent = createElement(RolesProvider, undefined, createElement(App));

/**
 * Creates the configured React application component.
 *
 * @param args - Fusion app host render arguments.
 * @returns A component bound to the cookbook configuration.
 */
const createApp = (args: ComponentRenderArgs) => makeComponent(appComponent, args, configure);

/**
 * Renders the Roles cookbook in a Fusion app host.
 *
 * @param element - DOM element receiving the React root.
 * @param args - Fusion app host render arguments.
 * @returns A function that unmounts the cookbook.
 */
export const renderApp = (element: HTMLElement, args: ComponentRenderArgs): VoidFunction => {
  const app = createApp(args);
  const root = createRoot(element);
  root.render(createElement(app));
  return () => root.unmount();
};

export default renderApp;
