import { FusionConfigurator } from '@equinor/fusion-framework-react';
import { ConsoleLogger } from '@equinor/fusion-framework-module-msal/client';

export const configure = async (config: FusionConfigurator) => {
    config.logger.level = 4;

    config.configureServiceDiscovery({
        client: {
            baseUri: import.meta.url,
            defaultScopes: ['97978493-9777-4d48-b38a-67b0b9cd88d2/.default'],
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

    config.onConfigured(() => {
        console.log('framework config done');
    });

    config.onInitialized(async (fusion) => {
        fusion.auth.defaultClient.setLogger(new ConsoleLogger(0));

        console.debug('📒 subscribing to all events');
        fusion.event.subscribe((e) => console.debug(`🔔🌍 [${e.type}]`, e));

        console.debug('📒 subscribing to [onReactAppLoaded]');
        fusion.event.addEventListener('onReactAppLoaded', (e) =>
            console.debug('🔔 [onReactAppLoaded]', e)
        );
    });
};

export default configure;
