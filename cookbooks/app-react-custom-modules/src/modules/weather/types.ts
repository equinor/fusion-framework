import { ObservableInput } from 'rxjs';

export interface IWeatherClient {
    getWeatherDataByLatLng: (lat: number, lng: number) => ObservableInput<WeatherData>;
}

export type WeatherData = {
    airTemperature: number;
};

export interface WeatherConfig {
    client: IWeatherClient;
}
