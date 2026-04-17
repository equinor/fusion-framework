import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { type ComponentRenderArgs, makeComponent } from '@equinor/fusion-framework-react-app';

import configure from './config';
import App from './App';

const appComponent = createElement(App);

const createApp = (args: ComponentRenderArgs) => makeComponent(appComponent, args, configure);

export const renderApp = (el: HTMLElement, args: ComponentRenderArgs): VoidFunction => {
  const app = createApp(args);
  const root = createRoot(el);
  root.render(createElement(app));
  return () => root.unmount();
};

export default renderApp;
