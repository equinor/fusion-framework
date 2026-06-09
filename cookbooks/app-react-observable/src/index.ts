import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { type ComponentRenderArgs, makeComponent } from '@equinor/fusion-framework-react-app';

import configure from './config';
import App from './App';

/** Observable cookbook root React element. */
const appComponent = createElement(App);

/**
 * Creates the Fusion app component for the observable cookbook.
 *
 * @param args - Component render arguments from the Fusion app host.
 * @returns A renderable Fusion React app component.
 */
const createApp = (args: ComponentRenderArgs): ReturnType<typeof makeComponent> =>
  makeComponent(appComponent, args, configure);

/**
 * Renders the observable cookbook application into a host element.
 *
 * @param el - Host element that receives the React root.
 * @param args - Component render arguments from the Fusion app host.
 * @returns A teardown callback that unmounts the React root.
 */
export const renderApp = (el: HTMLElement, args: ComponentRenderArgs): VoidFunction => {
  const app = createApp(args);
  const root = createRoot(el);

  root.render(createElement(app));

  return () => root.unmount();
};

export default renderApp;
