import { ObservableInput } from 'rxjs';
import { IHttpClient } from '@equinor/fusion-framework-module-http';
import type { WeatherData, IWeatherClient } from '../types';
import { HttpClient } from '@equinor/fusion-framework-module-http/client';

export class YrWeatherClient implements IWeatherClient {
    #httpClient: IHttpClient;

    constructor(httpClient: IHttpClient) {
        this.#httpClient = httpClient ?? new HttpClient('https://api.met.no');
    }
    getWeatherDataByLatLng(lat: number, lng: number): ObservableInput<WeatherData> {
        console.log('type: yr'); // @TODO: Remove
        return this.#httpClient.fetch(
            `/weatherapi/locationforecast/2.0/compact.json?lat=${lat}&lon=${lng}`,
            {
                selector: async (response: Response): Promise<WeatherData> => {
                    const result = JSON.parse(await response.text());

                    return {
                        airTemperature:
                            result.properties.timeseries[0].data.instant.details.air_temperature,
                    };
                },
            },
        );
    }
}
