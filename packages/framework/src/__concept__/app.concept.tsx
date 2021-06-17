/* eslint-disable */
import { registerApp } from '@equinor/fusion';
import { Fusion } from '..';

const App = () => <p>hello world</p>;

export const setup = (fusion: Fusion, env: Record<string, unknown>) => {
    const services = fusion.createServiceInstance((config) => {
        //@ts-ignore
        config.http.configureClient('app-client', env.endpoints.prod.myService);
        config.http.configureClient('data-proxy', 'https://somewhere-test.com');
        config.state.configureStore('my-store', (action$, state$, services) => {
            services.http.createClient('portal').fetch('sadasd')
        })
    });
    return (element: HTMLElement) => 
        //@ts-ignore
        ReactDOM.render(
            element,
            //@ts-ignore
            <FusionServiceProvider service={services}><App /></FusionServiceProvider>
    );
};

// legacy
registerApp('test-app', {
    setup
});

export default setup;
