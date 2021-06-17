/* eslint-disable */
import initFusion, { Fusion } from '..';


// portal.js
const init = initFusion((api) => {
    api.auth.configureClient('tennant-id', 'client-id', 'callack-url');

    api.http.configureClient('portal', 'https://somewhere.com');
    api.http.configureClient('data-proxy', 'https://somewhere.com');

    api.http.configureClient('test', (client) => {
        client.uri = 'https://somewhere.com';
        client.defaultScope = ['https://somewhere.com/read'];
        client.requestHandler.add('test', (request) => {
            const headers = new Headers(request.headers);
            headers.append('x-test', 'testing');
            return { ...request, headers };
        });
        client.requestHandler.setHeader('elg', 'bert');
    });

    //on route
    api.loadApp('dsdad') => {
        const appmanifest = getManifest('app');
        const setup = import('https://fusion-ci.dsdsads/apps/${appmanifest}')
        const render = setup(args);
        const el = document.createElement('div');
        const appRoot = document.getElementById('app-root');
        appRoot?.appendChild(el);
        render(el);
    }
});