import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { type ComponentRenderArgs, makeComponent } from '@equinor/fusion-framework-react-app';

import { App } from './App';
import { configure } from './config';

const appComponent = createElement(App);

/**
 * Creates the configured Header test application component.
 *
 * @param args - Runtime arguments supplied by the Fusion app loader.
 * @returns A configured React component.
 */
const createApp = (args: ComponentRenderArgs) => makeComponent(appComponent, args, configure);

/**
 * Mounts the Header component test cookbook in the dev portal.
 *
 * @param element - Host element provided by the Fusion app loader.
 * @param args - Runtime arguments supplied by the Fusion app loader.
 * @returns A callback that unmounts the cookbook.
 */
export const renderApp = (element: HTMLElement, args: ComponentRenderArgs): (() => void) => {
  const app = createApp(args);
  const root = createRoot(element);

  root.render(createElement(app));

  return () => root.unmount();
};

export default renderApp;
