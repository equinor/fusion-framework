import { createApp } from '@equinor/fusion-framework-react-app';

const App = () => <p>ok</p>;

export const render = createApp(App, (config) => {
    config.http.configureClient('foo', 'https://foo.bar');
});
