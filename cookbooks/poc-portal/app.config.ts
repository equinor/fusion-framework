import { defineAppConfig } from '@equinor/fusion-framework-cli';

export default defineAppConfig(() => ({
    environment: {
        apps: [
            {
                context: 'something',
                key: 'my-app',
            },
        ],
    },
}));
