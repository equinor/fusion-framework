import { ObservableInput } from 'rxjs';
import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { HttpClient } from '@equinor/fusion-framework-module-http/client';
import type { IWeatherClient, WeatherData } from '../types';

export interface WeatherDataByLatLngResult {
    current: {
        time: string;
        interval: number;
        temperature_2m: number;
    };
}

const selector = async (response: Response): Promise<WeatherData> => {
    const result = JSON.parse(await response.text()) as WeatherDataByLatLngResult;
    return {
        airTemperature: result.current.temperature_2m,
    };
};

export class OpenMeteoWeatherClient implements IWeatherClient {
    #httpClient: IHttpClient;

    constructor(httpClient?: IHttpClient) {
        this.#httpClient = httpClient ?? new HttpClient('https://api.open-meteo.com/');
    }
    getWeatherDataByLatLng(lat: number, lng: number): ObservableInput<WeatherData> {
        console.log('type: open'); // @TODO: remove
        return this.#httpClient.fetch(
            `/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m`,
            { selector },
        );
    }
}
