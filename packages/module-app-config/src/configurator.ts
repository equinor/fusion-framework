import type { IHttpClient } from '@equinor/fusion-framework-module-http';

import type { AppConfig } from './types';

export interface IAppConfigConfigurator<TEnvironment = unknown> {
    /** provide a http client */
    httpClient?: IHttpClient;

    /** Selector for processing response from config client */
    selector?: (result: Response) => Promise<AppConfig<TEnvironment>>;

    /** Function for building the config url */
    generateUrl(appKey: string, tag?: string): string;
}

export class AppConfigConfigurator<TEnvironment> implements IAppConfigConfigurator<TEnvironment> {
    public selector?: (result: Response) => Promise<AppConfig<TEnvironment>>;
    public httpClient?: IHttpClient;

    public generateUrl(appKey: string, tag?: string): string {
        return `/api/apps/${appKey}/config${tag ? `?tag=${tag}` : ''}`;
    }
}

export default AppConfigConfigurator;
