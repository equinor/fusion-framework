import { createApp, AppConfigurator } from '@equinor/fusion-framework-react-app';

import serviceDiscovery, {
    ServiceDiscoveryModule,
} from '@equinor/fusion-framework-module-service-discovery';

const App = () => <p>ok</p>;

const config: AppConfigurator<[ServiceDiscoveryModule]> = (config) => {
    config.serviceDiscovery.clientKey;
};

export const render = createApp(App, config, [serviceDiscovery]);
