import { createServer, defineConfig } from 'vite';

import { fusionSpaPlugin } from './vite-plugin-fusion-spa/index.js';

import viteEnv from 'vite-plugin-environment';

const start = async () => {
    const config = defineConfig({
        define: {
            'process.env.FUSION_LOG_LEVEL': '"debug"',
        },
        plugins: [
            // viteEnv({
            //     FUSION_LOG_LEVEL: 'debug',
            // }),
            fusionSpaPlugin(),
            {
                name: 'vite-env-check',
                configResolved(config) {
                    console.log('Vite config', config.env);
                },
            },
        ],
    });
    const server = await createServer(config);

    console.log('Starting server...');
    await server.listen(3001);
    console.log('Server started');
};

start();
