import createInstance, { AuthClient, createAuthClient } from '.';

async () => {
    const testing = await createInstance((root) => {
        root.auth.client = createAuthClient('ddasdas', 'dsadasdas', '/msal/auth') as AuthClient;

        root.http.configureClient('portal', 'https://somewhere.com');

        root.http.configureClient('test', (client) => {
            client.uri = 'https://somewhere.com';
            client.defaultScope = ['https://somewhere.com/read'];
            client.requestHandler.add('test', (request) => {
                const headers = new Headers(request.headers);
                headers.append('x-test', 'testing');
                return { ...request, headers };
            });
        });
    });
    const client = testing.http.createClient('portal');
    client.fetchAsync('api/v2/f-u');

    testing.registerApp('myapp', (app) => {
        app.http.configureClient('app-client', 'https://my-app.com');
    });
};
