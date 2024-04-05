import { ObservableInput } from 'rxjs';
import { IWeatherClient, WeatherConfig, WeatherData } from './types';

export class WeatherProvider {
    #client: IWeatherClient;

    constructor(config: WeatherConfig) {
        this.#client = config.client;
    }

    getWeatherData(lat: number, lng: number): ObservableInput<WeatherData> {
        return this.#client.getWeatherDataByLatLng(lat, lng);
    }
}
