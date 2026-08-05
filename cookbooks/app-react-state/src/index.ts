import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { type ComponentRenderArgs, makeComponent } from '@equinor/fusion-framework-react-app';

import { configure } from './config';
import { App } from './App';

/**
 * State Module Cookbook Entry Point
 *
 * This is the standard entry point for a Fusion Framework React app.
 * The key part for this cookbook is that we pass our 'configure' function
 * which enables the state module functionality.
 */

/** Create the main App component */
const appComponent = createElement(App);

/** Create React render root component with configuration */
const createApp = (args: ComponentRenderArgs) => makeComponent(appComponent, args, configure);

/**
 * Main render function - this is called by the Fusion portal
 * @param el - The HTML element to render the app into
 * @param args - Component render arguments from the portal
 * @returns Cleanup function to unmount the app
 */
export const renderApp = (el: HTMLElement, args: ComponentRenderArgs) => {
  /** Create the configured app */
  const app = createApp(args);

  /** Create React root from provided element */
  const root = createRoot(el);

  /** Render the application */
  root.render(createElement(app));

  /** Return cleanup function for proper teardown */
  return () => root.unmount();
};

export default renderApp;
