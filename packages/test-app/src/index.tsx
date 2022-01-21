import { AppConfigurator, createApp } from '@equinor/fusion-framework-react-app';
import serviceDiscovery, {
    ServiceDiscoveryModule,
} from '@equinor/fusion-framework-module-service-discovery';

const App = () => <p>ok</p>;

const defaultConfigurator: AppConfigurator = (config, _fusion, _env) => {
    config.auth;
};
defaultConfigurator;

const moduleCinfigurator: AppConfigurator<[ServiceDiscoveryModule]> = (config) => {
    config.serviceDiscovery.clientKey;
};
moduleCinfigurator;

export const defaultRender = createApp(App, (config) => {
    config.http.configureClient('foo', 'https://foo.bar');
});

export const moduleRender = createApp(
    App,
    (config) => {
        config.serviceDiscovery.clientKey;
    },
    [serviceDiscovery]
);
