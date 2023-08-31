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

type ProxyHandlerResult<T> = { response?: T; statusCode?: number; path?: string } | void;
type ProxyHandlerReturn<T> = Promise<ProxyHandlerResult<T>> | ProxyHandlerResult<T>;

export interface ProxyHandler {
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
export const createDevProxy = (
    handler: ProxyHandler,
    options: Pick<ProxyOptions, 'target'> & {
        staticAssets?: { path: string; options?: Parameters<typeof express.static>[1] }[];
    },
): Express => {
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

    const app = express();

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

    return app;
};

export default createDevProxy;
