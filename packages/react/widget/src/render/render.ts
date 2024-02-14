import {
    WidgetEnv,
    WidgetProps,
    WidgetRenderArgs,
    WidgetScriptModule,
} from '@equinor/fusion-framework-module-widget';
import { Fusion } from '@equinor/fusion-framework';

export const widgetRender = <TProps extends WidgetProps>(args: {
    script?: WidgetScriptModule<TProps>;
    element: HTMLDivElement;
    config: WidgetRenderArgs<Fusion, WidgetEnv, TProps>;
}) => {
    const { script, element, config } = args;

    if (!script) {
        throw Error('Render script is not provided');
    }

    const render = script.renderWidget ?? script.render ?? script.default;

    if (render && typeof render === 'function') {
        return render(element, config);
    }
    throw Error('Widget is not supported, no render function provided');
};
