import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { makeComponent, ComponentRenderArgs } from '@equinor/fusion-framework-react-app';

import configure from './config';

import App from './App';

const appComponent = createElement(App);

const createApp = (args: ComponentRenderArgs) => makeComponent(appComponent, args, configure);

export default function (el: HTMLElement, args: ComponentRenderArgs) {
    const app = createApp(args);
    const root = createRoot(el);
    root.render(createElement(app));
    return () => root.unmount();
}
