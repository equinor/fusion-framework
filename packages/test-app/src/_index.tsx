import { AppConfigurator, createApp } from '@equinor/fusion-framework-react-app';
import serviceDiscovery, {
    ServiceDiscoveryModule,
} from '@equinor/fusion-framework-module-service-discovery';

import tele, { TelemetryModule } from '@equinor/fusion-framework-module-telemetry';

const App = () => <p>ok</p>;

const defaultConfigurator: AppConfigurator = (config, _fusion, _env) => {
    config.auth;
};
defaultConfigurator;

const moduleCinfigurator: AppConfigurator<[ServiceDiscoveryModule, TelemetryModule]> = (config) => {
    config.serviceDiscovery.clientKey;
    config.telemetry.instrumentationKey = 'my-app-telemetry-key';
    config.telemetry.defaultTags = {
        'ai.cloud.role': 'Fusion Frontend',
        'ai.cloud.roleInstance': 'Portal',
    };
};

moduleCinfigurator;

export const defaultRender = createApp(App, (config) => {
    config.http.configureClient('foo', 'https://foo.bar');
});

// TODO - check resolve of deps array
export const moduleRender = createApp<[ServiceDiscoveryModule, TelemetryModule]>(
    App,
    (config) => {
        config.serviceDiscovery.clientKey;
    },
    [serviceDiscovery, tele]
);
