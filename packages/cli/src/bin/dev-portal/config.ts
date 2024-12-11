import { enableAppModule } from '@equinor/fusion-framework-module-app';
import { ConsoleLogger } from '@equinor/fusion-framework-module-msal/client';
import { enableBookmark } from '@equinor/fusion-framework-react-module-bookmark';
import { FrameworkConfigurator } from '@equinor/fusion-framework';
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import { enableServices } from '@equinor/fusion-framework-module-services';
import { enableFeatureFlagging } from '@equinor/fusion-framework-module-feature-flag';
import {
    createLocalStoragePlugin,
    createUrlPlugin,
} from '@equinor/fusion-framework-module-feature-flag/plugins';

export const configure = async (config: FrameworkConfigurator) => {
    config.configureServiceDiscovery({
        client: {
            baseUri:
                'https://discovery.fusion.equinor.com/service-registry/environments/ci/services',
            defaultScopes: ['5a842df8-3238-415d-b168-9f16a6a6031b/.default'],
        },
    });

    // Add custom client for app
    config.configureHttpClient('app', {
        baseUri: new URL('/apps-proxy/', window.location.href).href,
        defaultScopes: ['5a842df8-3238-415d-b168-9f16a6a6031b/.default'],
    });

    config.configureMsal(
        {
            tenantId: '3aa4a235-b6e2-48d5-9195-7fcf05b459b0',
            clientId: '9b707e3a-3e90-41ed-a47e-652a1e3b53d0',
            redirectUri: '/authentication/login-callback',
        },
        { requiresAuth: true },
    );

    enableAppModule(config);

    enableNavigation(config);

    enableServices(config);

    enableBookmark(config, (builder) => {
        builder.setSourceSystem({
            subSystem: 'CLI',
            identifier: 'fusion-cli',
            name: 'Fusion CLI',
        });
        // builder.setFilter('application', true);
        // builder.setLogLevel(4);
    });

    /* Adds demo portal features to cli */
    enableFeatureFlagging(config, (builder) => {
        builder.addPlugin(
            createLocalStoragePlugin([
                {
                    key: 'fusionDebug',
                    title: 'Fusion debug log',
                    description: 'Show Fusion debug log in console',
                },
                {
                    key: 'pinkBg',
                    title: 'Use pink bg?',
                    description: 'When enabled the background should be pink',
                },
            ]),
        );
        builder.addPlugin(createUrlPlugin(['fusionDebug']));
    });

    config.onConfigured(() => {
        console.log('framework config done');
    });

    config.onInitialized(async (fusion) => {
        fusion.auth.defaultClient.setLogger(new ConsoleLogger(0));
        console.debug('📒 subscribing to all events');
    });
};

export default configure;
