import { createComponent } from './create-component';
import { renderComponent, type RenderTeardown } from './render-component';

import type { ComponentRenderArgs } from './create-component';

/**
 * Creates a render function for an app component.
 * Uses React 18's createRoot API via renderComponent.
 * 
 * @param componentArgs - Arguments to pass to createComponent
 * @returns A function that renders the app into a DOM element
 */
export const renderApp = (...componentArgs: Parameters<typeof createComponent>) => {
  const renderer = renderComponent(createComponent(...componentArgs));
  return (el: HTMLElement, args: ComponentRenderArgs): RenderTeardown => {
    return renderer(el, args);
  };
};

export default renderApp;

