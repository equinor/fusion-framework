import { createComponent } from './create-component.js';
import { renderComponent, type RenderTeardown } from './render-component.js';

import type { ComponentRenderArgs } from './create-component.js';

/**
 * Creates a render function for a Fusion React application.
 *
 * Wraps {@link createComponent} and {@link renderComponent} into a single factory:
 * call the returned function with an `HTMLElement` and `ComponentRenderArgs` to
 * mount the app using React 18's `createRoot` API.
 *
 * @param componentArgs - Arguments forwarded to {@link createComponent} (the React
 *   component to render and an optional module-configuration callback).
 * @returns A mount function that accepts a DOM element and render args, and returns
 *   a {@link RenderTeardown} callback to unmount the application.
 *
 * @example
 * ```ts
 * import { renderApp } from '@equinor/fusion-framework-react-app';
 * import { App } from './App';
 * import { configure } from './config';
 *
 * export const render = renderApp(App, configure);
 * export default render;
 * ```
 */
export const renderApp = (...componentArgs: Parameters<typeof createComponent>) => {
  const renderer = renderComponent(createComponent(...componentArgs));
  return (el: HTMLElement, args: ComponentRenderArgs): RenderTeardown => {
    return renderer(el, args);
  };
};

export default renderApp;
