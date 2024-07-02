import express, { type Request, type Express } from 'express';

import cors from 'cors';

import {
    createProxyMiddleware,
    responseInterceptor,
    type Options as ProxyOptions,
} from 'http-proxy-middleware';

import { type IncomingMessage } from 'node:http';
import type { AppConfig, AppManifest } from '@equinor/fusion-framework-module-app';
import { Spinner } from './utils/spinner.js';
import chalk, { formatPath } from './utils/format.js';

type ProxyHandlerResult<T> = { response?: T; statusCode?: number; path?: string } | void;
type ProxyHandlerReturn<T> = Promise<ProxyHandlerResult<T>> | ProxyHandlerResult<T>;

const appServiceName = 'apps';
const appServiceURI = 'https://fusion-s-apps-ci.azurewebsites.net/';

type Slug = { appKey: string };
export interface ProxyHandler {
    onManifestListResponse(
        slug: Slug,
        message: IncomingMessage,
        data?: Array<AppManifest>,
    ): ProxyHandlerReturn<Array<AppManifest>>;
    onManifestResponse(
        slug: Slug,
        message: IncomingMessage,
        data?: AppManifest,
    ): ProxyHandlerReturn<AppManifest>;
    onConfigResponse(
        slug: Slug,
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
        port?: number;
    },
): Express => {
    const proxyOptions: ProxyOptions = Object.assign({
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
    } satisfies ProxyOptions);

    const app = express();

    // create a proxi for calling apps-service
    const proxyApi = express();
    const appServicePort = 3031;
    proxyApi.use(cors({ origin: `http://localhost:${options.port ?? 3000}` }));

    app.disable('x-powered-by');
    options.staticAssets?.forEach((asset) => {
        app.use(express.static(asset.path, asset.options));
    });

    app.use(
        '/_discovery/environments/current',
        createProxyMiddleware({
            target: options.target,
            ...{ ...proxyOptions, staticAssets: options.staticAssets },
            onProxyRes: responseInterceptor(async (responseBuffer, _proxyRes, req) => {
                const response = JSON.parse(responseBuffer.toString('utf8'));
                response.environmentName = 'DEVELOPMENT';
                const apiProxy = new URL(new URL('/', req.headers.referer).href);
                apiProxy.port = String(appServicePort);

                // find the key for apps-proxy
                const appProxy = response.services.find(
                    (x: { key: string }) => x.key === appServiceName,
                );
                if (appProxy) {
                    appProxy.uri = appServiceURI;
                    /* Remove apps-proxy from service response */
                    response.services = response.services.filter(
                        (x: { key: string }) => x.key !== appServiceName,
                    );
                    /** refer service [app] to vite middleware */
                    response.services.push({
                        ...appProxy,
                        uri: apiProxy.href,
                    });
                } else {
                    response.services.push({
                        key: appServiceName,
                        type: 'Service',
                        serviceName: null,
                        uri: apiProxy.href,
                        internal: false,
                    });
                }
                return JSON.stringify(response);
            }),
        }),
    );

    /* The order of the use statements is important since we need the most specific to trigger first */
    proxyApi.use(
        `/apps/:appKey/builds/:tag/config`,
        createProxyMiddleware({
            ...proxyOptions,
            target: appServiceURI,
            onProxyRes: createResponseInterceptor(handler.onConfigResponse),
        }),
    );

    proxyApi.get(
        `/apps/:appKey`,
        createProxyMiddleware({
            ...proxyOptions,
            target: appServiceURI,
            onProxyRes: createResponseInterceptor(handler.onManifestResponse),
        }),
    );

    proxyApi.listen(appServicePort, () => {
        console.log(
            chalk.green(`[apps-service]`),
            `Proxying to ${chalk.blue(appServiceURI)} on port ${chalk.blue(appServicePort)}`,
        );
    });

    return app;
};

export default createDevProxy;
