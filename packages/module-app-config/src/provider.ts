import { IAppConfigConfigurator } from 'configurator';
import type { ObservableInput } from 'rxjs';

import { AppConfig } from './types';

export interface IAppConfigProvider<TEnvironment = unknown> {
    getConfig: <T = TEnvironment>(appKey: string, tag?: string) => ObservableInput<AppConfig<T>>;
}

export class AppConfigProvider<TEnvironment = unknown> implements IAppConfigProvider<TEnvironment> {
    constructor(protected _config: IAppConfigConfigurator) {}
    public getConfig<T = TEnvironment>(
        appKey: string,
        tag?: string
    ): ObservableInput<AppConfig<T>> {
        const { generateUrl, selector, httpClient } = this._config as IAppConfigConfigurator<T>;
        if (!httpClient) {
            throw Error('No config client provided!');
        }
        return httpClient.json(generateUrl(appKey, tag), {
            selector,
        });
    }
}

export default AppConfigProvider;
