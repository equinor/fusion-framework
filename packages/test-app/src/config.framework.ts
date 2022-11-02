import { FusionConfigurator } from '@equinor/fusion-framework-react';
import { ConsoleLogger } from '@equinor/fusion-framework-module-msal/client';

import { configureAgGrid } from '@equinor/fusion-framework-module-ag-grid';
import { contextModule, ContextModule } from '@equinor/fusion-framework-module-context';
import { enableServices } from '@equinor/fusion-framework-module-services';
import { FusionModulesInstance } from '@equinor/fusion-framework';

export const configure = async (config: FusionConfigurator) => {
    config.logger.level = 4;

    config.configureServiceDiscovery({
        client: {
            baseUri: 'https://pro-s-portal-ci.azurewebsites.net',
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

    config.addConfig(
        configureAgGrid({
            licenseKey:
                'CompanyName=Equinor ASA,LicensedGroup=Fusion,LicenseType=MultipleApplications,LicensedConcurrentDeveloperCount=20,LicensedProductionInstancesCount=2,AssetReference=AG-026689,ExpiryDate=2_May_2023_[v2]_MTY4Mjk4MjAwMDAwMA==ca75ae051394e34c20407e0a3285ee58',
        })
    );

    // TODO - fix interface
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    enableServices(config);
    config.addConfig({ module: contextModule });

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

        const context = (fusion as unknown as FusionModulesInstance<[ContextModule]>).context;
        await context.contextClient.client
            .queryAsync(
                {
                    id: '29c865ad-1178-4dfd-9e8b-ed5440473da3',
                },
                { awaitResolve: true }
            )
            .then(({ value }) => {
                context.currentContext = value;
            });
    });
};

export default configure;
