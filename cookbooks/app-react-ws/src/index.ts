import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { ComponentRenderArgs, makeComponent } from '@equinor/fusion-framework-react-app';

import configure from './config';
import App from './App';

/** create a render component */
const appComponent = createElement(App);

/** create React render root component */
const createApp = (args: ComponentRenderArgs) => makeComponent(appComponent, args, configure);

/** Render function */
export const renderApp = (el: HTMLElement, args: ComponentRenderArgs) => {
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
