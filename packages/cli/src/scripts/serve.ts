import { createServer } from 'vite';
import type { UserConfig } from 'vite';

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

import express, { Request } from 'express';

import dns from 'dns';
dns.setDefaultResultOrder('verbatim');

import kleur from 'kleur';

import ora from 'ora';

import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware';

const resolveRelativePath = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const server = async (config: { viteConfig: UserConfig; appConfig: any }) => {
    const { manifest: appManifest } = config.appConfig;

    const app = express();

    app.disable('x-powered-by');

    const configHost = config.viteConfig.server?.host;
    // todo allow path
    const host = new URL('/', typeof configHost === 'string' ? configHost : 'http://localhost');
    host.port = String(config.viteConfig.server?.port ?? 3000);

    const spinner = ora('Configuring dev-server').start();
    const vite = await createServer(config.viteConfig);

    spinner.succeed('Configured dev-server');

    /** expose middlewares from vite (dev-server) */
    app.use(vite.middlewares);

    /** serve static files (portal prebuild) */
    app.use(express.static(resolveRelativePath('dev-portal'), { index: false }));

    app.use(
        createProxyMiddleware('/_discovery/environments/current', {
            target: 'https://pro-s-portal-ci.azurewebsites.net',
            changeOrigin: true,
            selfHandleResponse: true,
            onProxyRes: responseInterceptor(async (responseBuffer, _proxyRes, req) => {
                const response = JSON.parse(responseBuffer.toString('utf8'));
                response.environmentName = 'DEVELOPMENT';
                response.services = response.services.filter(
                    (x: { key: string }) => x.key !== 'app'
                );
                response.services.push({
                    key: 'app',
                    uri: new URL('/', req.headers.referer).href,
                });
                return JSON.stringify(response);
            }),
        })
    );

    app.get(
        '/api/apps/:appKey/config',
        // '/api/widget/:appKey/config',
        createProxyMiddleware('/api/apps/*/config', {
            target: 'https://pro-s-portal-ci.azurewebsites.net',
            changeOrigin: true,
            selfHandleResponse: true,
            onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
                const { appKey } = (req as Request<{ appKey: string }>).params;
                if (appManifest.key === appKey) {
                    const { endpoints, environment } = config.appConfig;
                    const response = { endpoints, environment };
                    if (Number(proxyRes.statusCode) === 404) {
                        res.statusCode = 200;
                        return JSON.stringify(response);
                    }
                    return JSON.stringify(
                        Object.assign(JSON.parse(responseBuffer.toString('utf8')), response)
                    );
                } else {
                    return responseBuffer;
                }
            }),
        })
    );

    app.get(
        '/api/apps/:appKey',
        createProxyMiddleware('/api/apps/*', {
            target: 'https://pro-s-portal-ci.azurewebsites.net',
            changeOrigin: true,
            selfHandleResponse: true,
            onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
                const { appKey } = (req as Request<{ appKey: string }>).params;
                if (appManifest.key === appKey) {
                    const response = {
                        ...appManifest,
                        entry: new URL(appManifest.main, req.headers.referer).href,
                    };
                    if (Number(proxyRes.statusCode) === 404) {
                        res.statusCode = 200;
                        return JSON.stringify(response);
                    }
                    return JSON.stringify(
                        Object.assign(JSON.parse(responseBuffer.toString('utf8')), response)
                    );
                } else {
                    return responseBuffer;
                }
            }),
        })
    );

    app.use('*', async (req, res) => {
        const htmlRaw = readFileSync(resolveRelativePath('dev-portal/index.html'), 'utf-8');
        const html = await vite.transformIndexHtml(req.url, htmlRaw);
        res.send(html);
    });

    spinner.start('Starting dev-server');
    const instance = app.listen(host.port);
    vite.watcher.on('change', async (x) => {
        if (x === config.appConfig.dev?.configSource?.file) {
            console.log('🛠', kleur.red('config changed, closing dev server'));
            await vite.close();
            instance.close();
            console.log('🚀', kleur.green('restarting server, please wait'));
            server(config);
        }
    });

    spinner.succeed(`dev server started`);
    console.log('🔗', kleur.underline().green(new URL(`/apps/${appManifest.key}`, host).href));
};

export default server;
