import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { type ComponentRenderArgs, makeComponent } from '@equinor/fusion-framework-react-app';
import { Router } from '@equinor/fusion-framework-react-router';
import { index, layout } from '@equinor/fusion-framework-react-router/routes';

import configure from './config';

/** route tree: a shared layout wrapping the index route (`src/routes/index.tsx`) */
const routes = layout('./routes/layout.tsx', [index('./routes/index.tsx')]);

/** create a render component */
const appComponent = createElement(Router, { routes });

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
