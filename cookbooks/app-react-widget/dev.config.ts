import { createDevConfig } from '@equinor/fusion-framework-cli';

export default createDevConfig(() => ({
    widgets: [
        {
            entryPoint: '/dist/widget-bundle.js',
            //entryPoint: 'src/index.ts',
            assetPath: '../widget-react-test/',
            name: 'widget1',
        },
        {
            entryPoint: '/dist/widget-bundle.js',
            //entryPoint: 'src/index.ts',
            assetPath: '../widget-react-test2/',
            name: 'widget2',
        },
    ],
}));
