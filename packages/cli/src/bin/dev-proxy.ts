import express, { type Request, type Express } from 'express';

import {
    createProxyMiddleware,
    responseInterceptor,
    type Options as ProxyOptions,
} from 'http-proxy-middleware';

import { type AppManifest } from '../lib/app-manifest.js';
import { type IncomingMessage } from 'node:http';
import { type AppConfig } from '../lib/app-config.js';
import { Spinner } from './utils/spinner.js';
import chalk, { formatPath } from './utils/format.js';
import { WidgetManifest } from '../lib/widget-manifest.js';
import { ConfigExecuterEnv } from '../lib/utils/config.js';

type ProxyHandlerResult<T> = { response?: T; statusCode?: number; path?: string } | void;
type ProxyHandlerReturn<T> = Promise<ProxyHandlerResult<T>> | ProxyHandlerResult<T>;

export interface ProxyHandler {
    onManifestListResponse(
        slug: object,
        message: IncomingMessage,
        data?: Array<AppManifest>,
    ): ProxyHandlerReturn<Array<AppManifest>>;
    onManifestResponse(
        slug: { appKey: string },
        message: IncomingMessage,
        data?: AppManifest,
    ): ProxyHandlerReturn<AppManifest>;
    onConfigResponse(
        slug: { appKey: string },
        message: IncomingMessage,
        data?: AppConfig,
    ): ProxyHandlerReturn<AppConfig>;
    onWidgetManifestResponse(
        slug: { widgetKey: string },
        message: IncomingMessage,
        data?: WidgetManifest,
    ): ProxyHandlerReturn<WidgetManifest>;
}

const createResponseInterceptor = <TArgs, TType>(
    cb: (args: TArgs, message: IncomingMessage, data?: TType) => ProxyHandlerReturn<TType>,
) => {
    return responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        res.setHeader('x-proxy-status-message', proxyRes.statusMessage ?? '');
        res.setHeader('x-proxy-status-code', proxyRes.statusCode ?? '');
        const { response, statusCode, path } =
            (await Promise.resolve(
                cb(
                    (req as Request<TArgs>).params,
                    proxyRes,
                    // might check??
                    Number(proxyRes.statusCode) < 400 &&
                        JSON.parse(responseBuffer.toString('utf8')),
                ),
            )) ?? {};
        if (statusCode) {
            res.statusCode = statusCode;
        }
        if (response) {
            path && res.setHeader('x-interceptor-handler', path);
            return JSON.stringify(response);
        }
        return responseBuffer;
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createDevProxy = async (
    handler: ProxyHandler,
    options: Pick<ProxyOptions, 'target'> & {
        staticAssets?: { path: string; options?: Parameters<typeof express.static>[1] }[];
    },
    config?: {
        configurator: (
            env: ConfigExecuterEnv,
            app: Express,
        ) => Promise<{ app: express.Express; hasWidgetConfig: boolean }>;
        env: ConfigExecuterEnv;
    },
): Promise<Express> => {
    const proxyOptions: ProxyOptions = Object.assign(
        {
            changeOrigin: true,
            selfHandleResponse: true,
            onProxyReq: (proxyReq) => {
                const spinner = Spinner.Clone();
                spinner.ora.suffixText = formatPath(
                    [proxyReq.protocol, '//', proxyReq.host, proxyReq.path].join(''),
                );
                spinner.start('proxy request');
                proxyReq.on('response', (res) => {
                    if (Number(res.statusCode) < 400) {
                        spinner.succeed();
                    } else {
                        spinner.warn(chalk.yellow(res.statusMessage ?? `${res.statusCode} `));
                    }
                    spinner.stop();
                });
                proxyReq.on('error', () => {
                    spinner.fail();
                });
            },
        } satisfies ProxyOptions,
        options,
    );

    const { app, hasWidgetConfig } = config
        ? await config.configurator(config.env, express())
        : { app: express(), hasWidgetConfig: false };

    app.disable('x-powered-by');

    options.staticAssets?.forEach((asset) => {
        app.use(express.static(asset.path, asset.options));
    });

    app.use(
        createProxyMiddleware('/_discovery/environments/current', {
            ...proxyOptions,
            onProxyRes: responseInterceptor(async (responseBuffer, _proxyRes, req) => {
                const response = JSON.parse(responseBuffer.toString('utf8'));
                response.environmentName = 'DEVELOPMENT';
                response.services = response.services.filter(
                    (x: { key: string }) => x.key !== 'app',
                );

                if (hasWidgetConfig) {
                    response.services = response.services.filter(
                        (x: { key: string }) => x.key !== 'apps',
                    );
                    response.services.push({
                        key: 'apps',
                        uri: new URL('/', req.headers.referer).href,
                    });
                }

                /** refer service [app] to vite middleware */
                response.services.push({
                    key: 'app',
                    uri: new URL('/', req.headers.referer).href,
                });

                return JSON.stringify(response);
            }),
        }),
    );

    app.get(
        '/api/apps/:appKey/config',
        // '/api/widget/:appKey/config',
        createProxyMiddleware('/api/apps/*/config', {
            ...proxyOptions,
            onProxyRes: createResponseInterceptor(handler.onConfigResponse),
        }),
    );

    app.get(
        '/api/apps/:appKey',
        createProxyMiddleware('/api/apps/*', {
            ...proxyOptions,
            onProxyRes: createResponseInterceptor(handler.onManifestResponse),
        }),
    );

    app.get(
        '/api/apps',
        createProxyMiddleware('/api/apps', {
            ...proxyOptions,
            onProxyRes: createResponseInterceptor(handler.onManifestListResponse),
        }),
    );

    app.get(
        '/widgets/*/versions/**',
        createProxyMiddleware('/widgets/*/versions/**', {
            changeOrigin: true,
            target: 'https://fusion-s-apps-ci.azurewebsites.net',
        }),
    );

    app.get(
        '/widgets/:widgetId',
        createProxyMiddleware('/widgets/*', {
            ...proxyOptions,
            target: 'https://fusion-s-apps-ci.azurewebsites.net',
            onProxyRes: createResponseInterceptor(handler.onWidgetManifestResponse),
        }),
    );

    return app;
};

export default createDevProxy;
