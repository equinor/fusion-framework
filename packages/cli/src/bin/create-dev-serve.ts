import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { assert } from 'node:console';

import { LibraryOptions, createServer } from 'vite';
import ViteRestart from 'vite-plugin-restart';

import portFinder from 'portfinder';

import { createDevProxy } from './dev-proxy.js';

import { loadAppConfig } from './utils/load-app-config.js';
import { loadViteConfig } from './utils/load-vite-config.js';

import { Spinner } from './utils/spinner.js';
import { chalk, formatPath } from './utils/format.js';

import { supportedExt, type ConfigExecuterEnv } from '../lib/utils/config.js';
import { manifestConfigFilename } from '../lib/app-manifest.js';
import { appConfigFilename, createAppConfig } from '../lib/app-config.js';
import { loadPackage } from './utils/load-package.js';

import { rateLimit } from 'express-rate-limit';
import { resolveAppKey } from '../lib/app-package.js';

export const createDevServer = async (options: {
    portal: string;
    configSourceFiles: {
        app?: string;
        manifest?: string;
        vite?: string;
    };
    devPortalPath: string;
    port?: number;
    library?: 'react';
}) => {
    const { configSourceFiles, library, portal, port, devPortalPath } = options;

    const spinner = Spinner.Global({ prefixText: chalk.dim('dev-server') });

    const pkg = await loadPackage();
    const appKey = resolveAppKey(pkg.packageJson);

    spinner.info(`using portal 🔌${formatPath(portal)} as proxy target`);

    const env: ConfigExecuterEnv = {
        command: 'serve',
        mode: process.env.NODE_ENV ?? 'development',
        root: pkg.root,
    };

    /**
     * Load application manifest
     * Application might have overridden the `appKey`
     */
    spinner.info(`resolved application key ${chalk.magenta(appKey)}`);

    const { viteConfig, path: viteConfigPath } = await loadViteConfig(env, {
        file: configSourceFiles.vite,
    });

    /** Add library/framework plugins */
    if (library === 'react') {
        const reactPlugin = await import('@vitejs/plugin-react');
        viteConfig.plugins.push(reactPlugin.default());
    }

    viteConfig.plugins.push(
        ViteRestart({
            restart: ['package.json', viteConfigPath].filter((x): x is string => !!x),
            /** reload the CLI when config changes, note change to APP-KEY need restart */
            reload: [
                ...supportedExt.map((ext) => [appConfigFilename, ext].join('')),
                ...supportedExt.map((ext) => [manifestConfigFilename, ext].join('')),
            ],
        }),
    );

    const vite = await createServer({ ...env, ...viteConfig });
    assert(vite.config.build.lib, 'expected vite build to have library defined');
    const { entry } = vite.config.build.lib as LibraryOptions;

    spinner.info('💾 application entrypoint', formatPath(String(entry)));

    spinner.info('resolving cli internal assets from ', formatPath(devPortalPath));

    const serverPort = port ?? (await portFinder.getPortPromise({ port: 3000 }));

    /** add proxy handlers */
    const server = createDevProxy(
        {
            onConfigResponse: async (slug, message, data) => {
                if (slug.appKey === appKey) {
                    if (message.statusCode === 404) {
                        const { config: response, path } = await loadAppConfig(env, pkg, {
                            file: configSourceFiles.app,
                        });
                        return { response, path, statusCode: 200 };
                    } else if (data) {
                        const { config: response, path } = await createAppConfig(env, data, {
                            file: configSourceFiles.app,
                        });
                        path && spinner.info('created config from ', formatPath(path));
                        return { response, path };
                    }
                }
            },
            onManifestResponse: async (slug, message, data) => {
                if (slug.appKey === appKey) {
                    if (message.statusCode === 404) {
                        const response = {
                            key: appKey,
                            name: pkg.packageJson.name,
                            build: {
                                version: pkg.packageJson.version,
                                entryPoint: `/${entry}`,
                            },
                        };
                        const path = configSourceFiles.manifest;
                        return { response, path, statusCode: 200 };
                    } else if (data) {
                        /* add package entry point for local development */
                        data.build ??= {};
                        data.build.entryPoint = `/${entry}`;

                        configSourceFiles.manifest &&
                            spinner.info(
                                'created manifest from ',
                                formatPath(configSourceFiles.manifest),
                            );
                        return { response: data, path: configSourceFiles?.manifest };
                    }
                }
            },
            onManifestListResponse: async (slug, message, data) => {
                // TODO: Verify if we should always only return current app or all apps from API + current app.
                const path = configSourceFiles.manifest;

                // no apps registered???
                if (!data) {
                    // generate AppManifest since the app is not registered
                    const response = [
                        {
                            key: appKey,
                            name: pkg.packageJson.name,
                            build: {
                                version: pkg.packageJson.version,
                                entryPoint: `/${entry}`,
                            },
                        },
                    ];
                    return { response, path };
                }

                const atIndex = data?.findIndex((manifest) => manifest.key === appKey) ?? -1;
                // If existing app, we need to change the entry-point.
                if (atIndex > -1) {
                    data[atIndex].build = Object.assign(data[atIndex].build ?? {}, {
                        entryPoint: `/${entry}`,
                    });
                } else {
                    // generate AppManifest since the app is not registered
                    const manifest = {
                        key: appKey,
                        name: pkg.packageJson.name,
                        build: {
                            version: pkg.packageJson.version,
                            entryPoint: `/${entry}`,
                        },
                    };
                    if (manifest.build) {
                        manifest.build.entryPoint = `/${entry}`;
                    }
                    data.push(manifest);
                }
                return { response: data, path };
            },
        },
        {
            target: portal,
            staticAssets: [{ path: devPortalPath }],
            port: serverPort,
        },
    );

    /** connect dev server to Vite */
    server.use(vite.middlewares);

    /** redirect all request that miss to index.html, SPA logic */
    server.use(
        '*',
        async (req, res) => {
            // TODO add check if file request
            const htmlRaw = readFileSync(join(devPortalPath + '/index.html'), 'utf-8');
            const html = await vite.transformIndexHtml(req.url, htmlRaw);
            res.send(html);
        },
        rateLimit({
            max: 10,
        }),
    );

    /** use provided port or resolve available  */
    spinner.start('🚀 start server');
    server.listen(serverPort);
    spinner.succeed();
    spinner.succeed(
        '🔗',
        chalk.underline.green(new URL(`/apps/${appKey}`, `http://localhost:${serverPort}`).href),
    );
};
