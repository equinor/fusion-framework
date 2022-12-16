import { FusionConfigurator } from '@equinor/fusion-framework-react';
import { enableAppModule } from '@equinor/fusion-framework-module-app';
import { ConsoleLogger } from '@equinor/fusion-framework-module-msal/client';

export const configure = async (config: FusionConfigurator) => {
    config.logger.level = 4;

    config.configureServiceDiscovery({
        client: {
            baseUri: import.meta.url,
            defaultScopes: ['5a842df8-3238-415d-b168-9f16a6a6031b/.default'],
        },
    });

    config.configureMsal(
        {
            tenantId: '3aa4a235-b6e2-48d5-9195-7fcf05b459b0',
            clientId: '9b707e3a-3e90-41ed-a47e-652a1e3b53d0',
            redirectUri: '/authentication/login-callback',
        },
        { requiresAuth: true }
    );

    enableAppModule(config);

    config.onConfigured(() => {
        console.log('framework config done');
    });

    config.onInitialized(async (fusion) => {
        fusion.auth.defaultClient.setLogger(new ConsoleLogger(0));

        console.debug('📒 subscribing to all events');
        fusion.event.subscribe((e) => console.debug(`🔔🌍 [${e.type}]`, e));
    });
};

export default configure;
