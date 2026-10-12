import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { type ComponentRenderArgs, makeComponent } from '@equinor/fusion-framework-react-app';

import configure from './config';
import App from './App';

const appComponent = createElement(App);

/**
 * Binds the cookbook to the Fusion app host without configuring telemetry.
 * @param args - App host configuration and framework modules.
 * @returns The component bound to this host.
 */
const createApp = (args: ComponentRenderArgs): ReturnType<typeof makeComponent> =>
  makeComponent(appComponent, args, configure);

/**
 * Mounts the telemetry cookbook and releases its React root when the host unloads it.
 * @param el - App host's mount element.
 * @param args - App host configuration and framework modules.
 * @returns A teardown callback for the mounted app.
 * @example
 * ```ts
 * const unmount = renderApp(element, args);
 * unmount();
 * ```
 */
export const renderApp = (el: HTMLElement, args: ComponentRenderArgs): (() => void) => {
  const app = createApp(args);
  const root = createRoot(el);
  root.render(createElement(app));
  return () => root.unmount();
};

export default renderApp;
