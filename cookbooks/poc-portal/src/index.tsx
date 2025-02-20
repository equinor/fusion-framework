import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { ModulesInstanceType } from '@equinor/fusion-framework-module';
import { Framework } from './Framework';

export const render = (el: HTMLElement, modules: ModulesInstanceType<[]>) => {
  createRoot(el).render(createElement(Framework, { modules }));
};

export default render;
