import { from } from 'rxjs';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { useObservableState } from '@equinor/fusion-observable/react';
import { useModule } from '@equinor/fusion-framework-react-module';

type Location = {
    name: string;
    lat: number;
    lng: number;
};

const locations: Location[] = [
    {
        name: 'Bouvet Stavanger',
        lat: 58.9163518,
        lng: 5.7295526,
    },
    {
        name: 'Casa Del Eikeland',
        lat: 10.36150643307849,
        lng: 123.61661547198139,
    },
    {
        name: 'Nikolic Bar',
        lat: 43.7163701,
        lng: 21.3701249,
    },
];

const useWeatherData = (location: Location) => {
    const weatherProvider = useModule('weatherModule');
    return useObservableState(
        useMemo(() => {
            return from(weatherProvider.getWeatherData(location.lat, location.lng));
        }, [weatherProvider, location]),
    );
};
export const App = () => {
    const [currentLocation, setCurrentLocation] = useState<Location>(locations[0]);

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            const key = e.target.value;
            const foundLocation = locations.find((location) => location.name === key);
            if (foundLocation) {
                setCurrentLocation(foundLocation);
            }
        },
        [setCurrentLocation],
    );

    const { value: weather } = useWeatherData(currentLocation);
    return (
        <div
            style={{
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f0f0f0',
                color: '#343434',
            }}
        >
            <h1>🚀 Hello Fusion 😎</h1>
            <select onChange={handleChange}>
                {locations.map((location) => {
                    return (
                        <option key={location.name} value={location.name}>
                            {location.name}
                        </option>
                    );
                })}
            </select>
            <p>
                {currentLocation.name}: {weather?.airTemperature ?? ''}C
            </p>
        </div>
    );
};

export default App;
