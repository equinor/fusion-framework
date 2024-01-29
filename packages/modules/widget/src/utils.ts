import { GetWidgetParameters, WidgetEndpointBuilder } from './types';

export const removeTrailingSlashFromURI = (uri: string): string => {
    return uri.at(-1) === '/' ? uri.slice(0, -1) : uri;
};

export const defaultEndpointBuilder =
    (apiVersion: string): WidgetEndpointBuilder =>
    (params: GetWidgetParameters) => {
        const { widgetKey, args } = params;
        const { type, value } = args ?? {};
        switch (type) {
            case 'tag':
            case 'version':
                return `/widgets/${widgetKey}/versions/${value}?api-version=${apiVersion}`;
            default:
                return `/widgets/${widgetKey}?api-version=${apiVersion}`;
        }
    };
