/* eslint-disable */
import initFusion, { Fusion } from '..';


// portal.js
const init = initFusion((api) => {
    api.auth.configureClient('ddasdas', 'dsadasdas', '/msal/auth');

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

    // on route
    // api.loadApp('dsdad') => {
    //     const appmanifest = getManifest('app');
    //     const setup = import('https://fusion-ci.dsdsads/apps/${appmanifest}')
    //     const render = setup(args);
    //     render(el);
    // }
});


// app.ts
export const setup = (fusion: Fusion, env: Record<string, unknown>) => {
    const services = fusion.createServiceInstance((config) => {
        //@ts-ignore
        config.http.configureClient('app-client', env.endpoints.prod.myService);
        config.http.configureClient('data-proxy', 'https://somewhere-test.com');
    });
    return (element: HTMLElement) => 
        //@ts-ignore
        ReactDOM.render(
            element,
            //@ts-ignore
            <FusionServiceProvider service={services}><MyApp /></FusionServiceProvider>
    );
};



// on route
init.then(async (config) => {
    // global services
    window.Fusion.services.http
        .createClient('portal')
        .fetch('api/apps')
        .subscribe(async (res) => console.log(await res.json()));

    // scoped services
    const services = await window.Fusion.createServiceInstance((app) => {
        app.http.configureClient('app-client', 'https://my-app.com');
    });

    const client = services.http.createClient('app-client');
    const response = await client.fetchAsync('api/v2/f-u');
    if (!response.ok) {
        // do something;
        throw Error('invalid something');
    }
});

// type ClientNames = "portal"|"dataproxy";
// type CustomClientNames = ClientNames;

// // Fluff
// declare module "@equinor/fusion-react" {
//     export type CustomClientNames = "myclient";
// }

// const useApiClient = (key: CustomClientNames) => {
//     const context = useContext(ServiceContext);
//     return context.createClient(key);
// }

// // useApiClient('')

// const MyApp = () => {
//     const myClient = useApiClient('app-client');
// }
// export default setup;
