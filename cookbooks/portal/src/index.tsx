import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { Portal } from './Portal';

export const render = (el: HTMLElement) => {
  createRoot(el).render(createElement(Portal));
};
export default render;
