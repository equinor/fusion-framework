import {
    BaseConfigBuilder,
    ConfigBuilderCallback,
    ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';
import { HttpClient } from '@equinor/fusion-framework-module-http/client';
import { IWeatherClient, WeatherConfig } from './types';
import { YrWeatherClient } from './clients/YrWeaterClient';

export class WeatherConfigBuilder extends BaseConfigBuilder<WeatherConfig> {
    public configureClient(cb: ConfigBuilderCallback<WeatherConfig['client']>) {
        this._set('client', cb);
    }

    public setClient(client: IWeatherClient) {
        this._set('client', () => client);
    }

    async _processConfig(config: Partial<WeatherConfig>, _init: ConfigBuilderCallbackArgs) {
        if (!config.client) {
            const httpClient = new HttpClient('https://api.met.no');
            config.client = new YrWeatherClient(httpClient);
        }
        return config as WeatherConfig;
    }
}
