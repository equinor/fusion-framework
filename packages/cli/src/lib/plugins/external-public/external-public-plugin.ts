import { join } from 'node:path';
import { readFileSync } from 'node:fs';

import { type Plugin } from 'vite';

/**
 * Creates a plugin that serves an external public directory.
 *
 * This plugin is useful when you want to serve a static site from a different directory than the one where the Vite server is running.
 * Vite`s built in `mode: 'spa'` will only look for the `index.html` file in the configured `root` directory,
 * so this plugin is necessary to serve the `index.html` file from a different directory.
 *
 * @param path - The path to the external public directory.
 * @returns A Plugin object configured to serve the specified public directory.
 *
 * The plugin:
 * - Sets the `publicDir` configuration to the provided path.
 * - Adds a middleware to the server that serves the `index.html` file from the specified path.
 *
 * The middleware:
 * - Reads the `index.html` file from the specified path.
 * - Transforms the HTML using the server's `transformIndexHtml` method.
 * - Responds with the transformed HTML, setting appropriate headers.
 */
export const externalPublicPlugin = (path: string): Plugin => {
    return {
        name: 'fusion:external-public',
        apply: 'serve',
        config(config) {
            config.publicDir = path;
        },
        configureServer(server) {
            // intercept requests to serve the index.html file
            server.middlewares.use(async (req, res, next) => {
                if (
                    // Only accept GET or HEAD
                    (req.method !== 'GET' && req.method !== 'HEAD') ||
                    // Only accept text/html
                    !req.headers.accept?.includes('text/html')
                ) {
                    return next();
                }
                try {
                    // load the raw html from provided path
                    const htmlRaw = readFileSync(join(path, 'index.html'), 'utf-8');
                    // transform the html, this is where vite plugin hooks are applied
                    const html = await server.transformIndexHtml(
                        req.url!,
                        htmlRaw,
                        req.originalUrl,
                    );

                    // apply content headers and configured additional headers
                    res.writeHead(200, {
                        'content-type': 'text/html',
                        'content-length': Buffer.byteLength(html),
                        'cache-control': 'no-cache',
                        ...server.config.server.headers,
                    });

                    // send the transformed html and end the response
                    res.end(html);
                } catch (e) {
                    next(e);
                }
            });
        },
    };
};

export default externalPublicPlugin;
