import { join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

import mime from 'mime';

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
 * - Sets the `path` configuration to the provided path.
 * - Adds a middleware to the server that serves static assets from the specified path.
 * - Adds a middleware to the server that serves the `index.html` file from the specified path.
 *
 * The middleware:
 * - Checks if the request is for a static asset and serves it from the specified path.
 * - Reads the `index.html` file from the specified path.
 * - Transforms the HTML using the server's `transformIndexHtml` method.
 * - Responds with the transformed HTML, setting appropriate headers.
 */
export const externalPublicPlugin = (path: string): Plugin => {
    let root: string;
    return {
        name: 'fusion:external-public',
        apply: 'serve',
        configResolved(config) {
            // set the path configuration to the provided path
            root = config.root;
        },
        configureServer(server) {
            // serve the static assets from the provided path
            server.middlewares.use(async (req, res, next) => {
                const [urlPath] = req.url!.split('?');

                const assetPath = join(path, urlPath);

                if (
                    // skip if the request is for index.html
                    req.url?.match('index.html') ||
                    // skip if request is for a source file
                    existsSync(join(root, urlPath)) ||
                    // skip if asset does not exist
                    !existsSync(assetPath)
                ) {
                    return next();
                }

                try {
                    const content = readFileSync(assetPath);
                    const contentType = mime.getType(assetPath) || 'application/octet-stream';
                    res.writeHead(200, {
                        'content-type': contentType,
                        'content-length': Buffer.byteLength(content),
                        'cache-control': 'no-cache',
                        ...server.config.server.headers,
                    });
                    res.end(content);
                } catch (e) {
                    next(e);
                }
            });

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
