import { AuthClient, createAuthClient } from '@equinor/fusion-web-msal';
import { ServiceConfig, ServiceConfigurator, Services } from './types';

export const configurator: ServiceConfigurator = (
    config: Partial<ServiceConfig>,
    services?: Services
) => {
    config.auth = {
        client: services?.auth,
        configureClient(...args: Parameters<typeof createAuthClient>) {
            this.client = createAuthClient(...args) as AuthClient;
        },
    };
    return (_services: Partial<Services>) => {
        const client = config.auth?.client;
        if (!client) {
            throw Error('Missing auth-client, either provide or create a client');
        }
        return {
            auth: {
                client,
                acquireToken(args: { scopes: string[] }) {
                    return client.acquireToken(args);
                },
                async acquireAccessToken(args: { scopes: string[] }) {
                    const token = await this.acquireToken(args);
                    return token ? token.accessToken : undefined;
                },
                login() {
                    client.login();
                },
            },
        };
    };
};

export default configurator;
