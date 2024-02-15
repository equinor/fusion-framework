import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { WidgetRenderArgs, makeWidgetComponent } from '@equinor/fusion-framework-react-widget';

import configure from './config';
import { Widget } from './Widget';

/** create a render component */
const widgetComponent = createElement(Widget);

type Test = {};

/** create React render root component */
const createWidget = (args: WidgetRenderArgs<any, any>) =>
    makeWidgetComponent(widgetComponent, args, configure);

/** Render function */
export const renderApp = (el: HTMLElement, args: WidgetRenderArgs) => {
    /** make render element */
    const app = createWidget(args);

    /** create render root from provided element */
    const root = createRoot(el);

    /** render Application */
    root.render(createElement(app));

    /** Teardown */
    return () => root.unmount();
};

export default renderApp;
