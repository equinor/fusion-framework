import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { module as WeatherModule } from './modules/weather/WeatherModule';
import { OpenMeteoWeatherClient } from './modules/weather/clients/OpenMeteoWeatherClient';

export const configure: AppModuleInitiator = (configurator, env) => {
    configurator.addConfig({
        module: WeatherModule,
        configure: (builder) => {
            // Opt #1
            builder.setClient(new OpenMeteoWeatherClient());

            // Opt #2
            // builder.configureClient(async (asdf) => {
            //     const httpProvider = await asdf.requireInstance('http');
            //     const httpClient = httpProvider.createClient('openmeteo');
            //     return new OpenMeteoWeatherClient(httpClient);
            // });
        },
    });

    // For Opt #2
    // configurator.configureHttpClient('openmeteo', { baseUri: 'https://api.open-meteo.com/' });

    /** print render environment arguments */
    console.log('configuring application', env);

    /** callback when configurations is created */
    configurator.onConfigured((config) => {
        console.log('application config created', config);
    });

    /** callback when the application modules has initialized */
    configurator.onInitialized((instance) => {
        console.log('application config initialized', instance);
    });
};

export default configure;
