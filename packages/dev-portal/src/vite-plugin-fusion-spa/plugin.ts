import { type Plugin } from 'vite';

import { dirname } from 'node:path/posix';

export type PluginOptions = {
    assetPath: string;
};

import template from './index.html.js';
import { configureEnvironment } from './configure-environment.js';

const scriptPath = dirname(import.meta.url.replace('file://', ''));

export const plugin = (): Plugin => ({
    name: 'vite-plugin-fusion-spa',
    // config() {
    //     return {
    //         define: {
    //             'import.meta.env.VITE_TEST_MESSAGE': JSON.stringify('moo'),
    //             'import.meta.env.VITE_TEST_MESSAGES': JSON.stringify('moo2'),
    //         },
    //     };
    // },
    config: configureEnvironment,
    resolveId(id) {
        if (id === '/boot-loader.ts') {
            console.log('Resolving boot-loader.ts', `${scriptPath}/hello.js`);
            return `${scriptPath}/boot-loader.js`;
        }
    },
    configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
            if (req.method !== 'GET' || !req.headers.accept?.includes('text/html')) {
                return next();
            }

            const html = await server.transformIndexHtml(req.url!, template, req.originalUrl);

            res.writeHead(200, {
                'content-type': 'text/html',
                'content-length': Buffer.byteLength(html),
                'cache-control': 'no-cache',
                ...server.config.server.headers,
            });
            return res.end(html);
        });
    },
});

export default plugin;
