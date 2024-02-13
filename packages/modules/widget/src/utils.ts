import { GetWidgetParameters, IClient, WidgetEndpointBuilder } from './types';
import { IHttpClient } from '@equinor/fusion-framework-module-http';

export const defaultManifestEndpointBuilder =
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

export const defaultConfigEndpointBuilder =
    (apiVersion: string): WidgetEndpointBuilder =>
    (params: GetWidgetParameters) => {
        const { widgetKey, args } = params;
        const { type, value } = args ?? {};
        // Todo Align endpoints with backend when its done!
        switch (type) {
            case 'tag':
            case 'version':
                return `/widgets/${widgetKey}/versions/${value}/config?api-version=${apiVersion}`;
            default:
                return `/widgets/${widgetKey}/config?api-version=${apiVersion}`;
        }
    };

export const createDefaultClient = (httpClient: IHttpClient): IClient => {
    const apiVersion = '1.0-preview';
    return {
        apiVersion,
        baseImportUrl: httpClient.uri,
        getWidgetManifest: {
            client: {
                fn: (args) => httpClient.json$(defaultManifestEndpointBuilder(apiVersion)(args)),
            },
            key: (args) => JSON.stringify(args),
        },
        getWidgetConfig: {
            client: {
                fn: (args) => httpClient.json$(defaultConfigEndpointBuilder(apiVersion)(args)),
            },
            key: (args) => JSON.stringify(args),
        },
    };
};
