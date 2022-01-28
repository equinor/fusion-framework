import { createFrameworkProvider } from '@equinor/fusion-framework-react';
import { ConsoleLogger } from '@equinor/fusion-framework-module-msal/client';

export const Framework = createFrameworkProvider(async (config) => {
    console.debug('configuring framework');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // const serviceConfig: ServiceConfig | undefined = await fetch('/env/portal-client-id').then((x) => x.json());
    config.auth.configureDefault({
        tenantId: '3aa4a235-b6e2-48d5-9195-7fcf05b459b0',
        clientId: '9b707e3a-3e90-41ed-a47e-652a1e3b53d0',
        redirectUri: '/authentication/login-callback',
    });
    // add a setup method for this!
    config.http.configureClient('service_discovery', {
        baseUri: 'https://pro-s-portal-ci.azurewebsites.net',
        defaultScopes: ['97978493-9777-4d48-b38a-67b0b9cd88d2/.default'],
    });
    config.onAfterConfiguration(() => {
        console.debug('framework config done');
    });
    config.onAfterInit(async (fusion) => {
        fusion.auth.defaultClient.setLogger(new ConsoleLogger(3));
        await fusion.auth.handleRedirect();
        if (!fusion.auth.defaultAccount) {
            await fusion.auth.login();
        }
    });
});

export default Framework;
