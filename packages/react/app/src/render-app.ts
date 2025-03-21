import { createComponent } from './create-component';
import { renderComponent, type RenderTeardown } from './render-component';

import type { ComponentRenderArgs } from './create-component';

/** @deprecated */
export const renderApp = (...componentArgs: Parameters<typeof createComponent>) => {
  const renderer = renderComponent(createComponent(...componentArgs));
  return (el: HTMLElement, args: ComponentRenderArgs): RenderTeardown => {
    return renderer(el, args);
  };
};

export default renderApp;
