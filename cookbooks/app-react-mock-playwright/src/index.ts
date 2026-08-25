import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { type ComponentRenderArgs, makeComponent } from '@equinor/fusion-framework-react-app';
import { Router } from '@equinor/fusion-framework-react-router';
import { index, layout, route } from '@equinor/fusion-framework-react-router/routes';

import configure from './config';

/** Route tree with one page for each mock-service ownership and discovery scenario. */
const routes = layout('./routes/layout.tsx', [
  index('./routes/index.tsx'),
  route('people', './routes/people/index.tsx'),
  route('aurora', './routes/aurora/index.tsx'),
]);

/** create a render component */
const appComponent = createElement(Router, { routes });

/** create React render root component */
const createApp = (args: ComponentRenderArgs) => makeComponent(appComponent, args, configure);

/**
 * Mounts the mock-service cookbook application into a host element.
 *
 * @param el - DOM element that will own the React root.
 * @param args - Fusion component render arguments passed through application configuration.
 * @returns A teardown callback that unmounts the React root from the host element.
 */
export const renderApp = (el: HTMLElement, args: ComponentRenderArgs): (() => void) => {
  /** make render element */
  const app = createApp(args);

  /** create render root from provided element */
  const root = createRoot(el);

  /** render Application */
  root.render(createElement(app));

  /** Teardown */
  return () => root.unmount();
};

export default renderApp;
