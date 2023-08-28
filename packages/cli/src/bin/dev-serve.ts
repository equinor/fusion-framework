import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { assert } from 'node:console';

import { LibraryOptions, createServer } from 'vite';
import ViteRestart from 'vite-plugin-restart';

import portFinder from 'portfinder';

import { createDevProxy } from './dev-proxy.js';

import { loadAppConfig } from './utils/load-app-config.js';
import { loadViteConfig } from './utils/load-vite-config.js';
import { loadAppManifest } from './utils/load-manifest.js';

import { Spinner } from './utils/spinner.js';
import { chalk, formatPath } from './utils/format.js';

import { supportedExt, type ConfigExecuterEnv } from '../lib/utils/config.js';
import { createManifest, manifestConfigFilename } from '../lib/app-manifest.js';
import { appConfigFilename, createAppConfig } from '../lib/app-config.js';
import { loadPackage } from './utils/load-package.js';

const resolveRelativePath = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export const createDevServer = async (options: {
    portal: string;
    configSourceFiles: {
        app?: string;
        manifest?: string;
        vite?: string;
    };
    port?: number;
    library?: 'react';
}) => {
    const { configSourceFiles, library, portal, port } = options;

    const spinner = Spinner.Global({ prefixText: chalk.dim('dev-server') });

    const pkg = await loadPackage();

    spinner.info(`using portal 🔌${formatPath(portal)} as proxy target`);

    const env: ConfigExecuterEnv = {
        command: 'build',
        mode: process.env.NODE_ENV ?? 'development',
        root: pkg.root,
    };

    /**
     * Load application manifest
     * Application might have overridden the `appKey`
     */
    const manifest = await loadAppManifest(env, pkg, { file: configSourceFiles.manifest });
    const { key: appKey } = manifest.manifest;
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

    const devPortalPath = resolveRelativePath('public');
    spinner.info('resolving cli internal assets from ', formatPath(devPortalPath));

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
                            file: configSourceFiles.manifest,
                        });
                        path && spinner.info('created config from ', formatPath(path));
                        return { response, path };
                    }
                }
            },
            onManifestResponse: async (slug, message, data) => {
                if (slug.appKey === appKey) {
                    if (message.statusCode === 404) {
                        const { manifest: response, path } = await loadAppManifest(env, pkg, {
                            file: configSourceFiles.manifest,
                        });
                        response.entry = `/${entry}`;
                        return { response, path, statusCode: 200 };
                    } else if (data) {
                        const { manifest: response, path } = await createManifest(env, data, {
                            file: configSourceFiles.manifest,
                        });
                        response.entry = `/${entry}`;
                        path && spinner.info('created manifest from ', formatPath(path));
                        return { response, path };
                    }
                }
            },
        },
        {
            target: portal,
            staticAssets: [{ path: devPortalPath }],
        },
    );

    /** connect dev server to Vite */
    server.use(vite.middlewares);

    /** redirect all request that miss to index.html, SPA logic */
    server.use('*', async (req, res) => {
        // TODO add check if file request
        const htmlRaw = readFileSync(resolveRelativePath('public/index.html'), 'utf-8');
        const html = await vite.transformIndexHtml(req.url, htmlRaw);
        res.send(html);
    });

    /** use provided port or resolve available  */
    const serverPort = port ?? (await portFinder.getPortPromise({ port: 3000 }));
    spinner.start('🚀 start server');
    server.listen(serverPort);
    spinner.succeed();
    spinner.succeed(
        '🔗',
        chalk.underline.green(new URL(`/apps/${appKey}`, `http://localhost:${serverPort}`).href),
    );
};
