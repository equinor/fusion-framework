import {
    createServer,
    defineConfig,
    mergeConfig,
    type LibraryOptions,
    type UserConfig,
} from 'vite';

import { assert } from 'node:console';
import { join, relative } from 'node:path';

import portFinder from 'portfinder';

import ViteRestart from 'vite-plugin-restart';
import { appProxyPlugin } from './plugins/app-proxy.js';
import { externalPublicPlugin } from './plugins/external-public.js';

import { supportedExt, type ConfigExecuterEnv } from '../lib/utils/config.js';
import { manifestConfigFilename } from '../lib/app-manifest.js';
import { appConfigFilename } from '../lib/app-config.js';
import { resolveAppKey } from '../lib/app-package.js';

import { loadAppConfig } from './utils/load-app-config.js';
import { loadViteConfig } from './utils/load-vite-config.js';
import { loadPackage } from './utils/load-package.js';
import { Spinner } from './utils/spinner.js';
import { chalk, formatPath } from './utils/format.js';
import { loadAppManifest } from './utils/load-manifest.js';
import proxyRequestLogger from './utils/proxy-request-logger.js';

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
    const { configSourceFiles, library, port, devPortalPath } = options;

    const spinner = Spinner.Global({ prefixText: chalk.dim('dev-server') });

    const pkg = await loadPackage();
    const appKey = resolveAppKey(pkg.packageJson);

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

    const { viteConfig: baseViteConfig, path: viteConfigPath } = await loadViteConfig(env, {
        file: configSourceFiles.vite,
    });

    /**
     * Defines the configuration for the development server.
     */
    const devServerConfig = defineConfig({
        publicDir: devPortalPath,
        appType: 'custom',
        server: {
            open: `/apps/${appKey}`,
            port: port ?? (await portFinder.getPortPromise({ port: 3000 })),
        },
        plugins: [
            // Serve the dev portal as static files
            externalPublicPlugin(devPortalPath),
            // Proxy requests to the app server
            appProxyPlugin({
                proxy: {
                    path: '/apps-proxy',
                    target: 'https://fusion-s-apps-ci.azurewebsites.net/',
                    onProxyReq: proxyRequestLogger,
                },
                app: {
                    key: appKey,
                    version: String(pkg.packageJson.version),
                    generateConfig: async () => {
                        const { config } = await loadAppConfig(env, pkg, {
                            file: configSourceFiles.app,
                        });
                        return config;
                    },
                    generateManifest: async () => {
                        const { manifest } = await loadAppManifest(env, pkg, {
                            file: configSourceFiles.manifest,
                        });
                        const assetPath = `bundles/apps/${appKey}/${pkg.packageJson.version}`;
                        // TODO: @eikeland we need to fix this
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        return {
                            appKey,
                            build: {
                                ...manifest,
                                assetPath,
                                configUrl: `${assetPath}/config`,
                            },
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } as any;
                    },
                },
            }),
            // Restart the server when config changes or the dev portal source is updated
            ViteRestart({
                restart: [
                    'package.json',
                    viteConfigPath,
                    join(relative(process.cwd(), devPortalPath), '/**/*'),
                ].filter((x): x is string => !!x),
                /** reload the CLI when config changes, note change to APP-KEY need restart */
                reload: [
                    ...supportedExt.map((ext) => [appConfigFilename, ext].join('')),
                    ...supportedExt.map((ext) => [manifestConfigFilename, ext].join('')),
                ],
            }),
        ],
    });

    // Merge the base Vite config with the dev server config
    const viteConfig = mergeConfig(devServerConfig, baseViteConfig) as UserConfig;

    /** Add library/framework plugins */
    if (library === 'react') {
        const reactPlugin = await import('@vitejs/plugin-react');
        viteConfig.plugins!.push(reactPlugin.default());
    }

    assert(viteConfig.build?.lib, 'expected vite build to have library defined');

    const { entry } = viteConfig.build!.lib as LibraryOptions;

    spinner.info('💾 application entrypoint', formatPath(String(entry), { relative: true }));

    spinner.info(
        'resolving cli internal assets from',
        formatPath(String(viteConfig.publicDir), { relative: true }),
    );

    const vite = await createServer({ ...env, ...viteConfig });

    spinner.start('🚀 start server');
    await vite.listen();
    spinner.succeed(
        '🔗',
        chalk.underline.green(
            new URL(
                `/apps/${appKey}`,
                vite.resolvedUrls?.local[0] ?? `https://localhost:/${vite.config.server.port}`,
            ).href,
        ),
    );
};
