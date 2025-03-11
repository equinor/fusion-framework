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

import deepmerge from 'deepmerge/index.js';

import ViteRestart from 'vite-plugin-restart';
import { appProxyPlugin } from '../lib/plugins/app-proxy/app-proxy-plugin.js';
import { helpProxyPlugin } from '../lib/plugins/help-proxy/help-proxy-plugin.js';
import { appSettingsPlugin } from '../lib/plugins/app-settings/index.js';
import { externalPublicPlugin } from '../lib/plugins/external-public/external-public-plugin.js';

import { supportedExt, type ConfigExecuterEnv } from '../lib/utils/config.js';
import { manifestConfigFilename } from '../lib/app-manifest.js';
import { appConfigFilename } from '../lib/app-config.js';

import { loadAppConfig } from './utils/load-app-config.js';
import { loadViteConfig } from './utils/load-vite-config.js';
import { loadPackage } from './utils/load-package.js';
import { Spinner } from './utils/spinner.js';
import { chalk, formatPath } from './utils/format.js';
import { loadAppManifest } from './utils/load-manifest.js';
import { proxyRequestLogger } from './utils/proxy-request-logger.js';

import type { AppManifest } from '@equinor/fusion-framework-module-app';

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
  noOpen: boolean;
}) => {
  const { configSourceFiles, library, port, devPortalPath, noOpen } = options;

  const spinner = Spinner.Global({ prefixText: chalk.dim('dev-server') });

  const pkg = await loadPackage();

  const env: ConfigExecuterEnv = {
    command: 'serve',
    mode: process.env.NODE_ENV ?? 'development',
    root: pkg.root,
  };

  const generateManifest = async () => {
    const { manifest } = await loadAppManifest(env, pkg, {
      file: configSourceFiles.manifest,
    });
    const assetPath = `bundles/apps/${manifest.appKey}/${pkg.packageJson.version}`;
    return deepmerge(manifest, {
      build: {
        assetPath,
        configUrl: `${assetPath}/config`,
      },
    }) as AppManifest;
  };

  const generateConfig = async () => {
    const { config } = await loadAppConfig(env, pkg, {
      file: configSourceFiles.app,
    });
    return config;
  };

  const { appKey } = await generateManifest();

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
      open: !noOpen ? `/apps/${appKey}` : false,
      port: port ?? (await portFinder.getPortPromise({ port: 3000 })),
    },
    plugins: [
      // Serve the dev portal as static files
      externalPublicPlugin(devPortalPath),
      appSettingsPlugin({
        match: `/apps-proxy/persons/me/apps/${appKey}/settings`,
      }),
      // Proxy requests to the app server
      appProxyPlugin({
        proxy: {
          path: '/apps-proxy',
          target: 'https://apps.ci.api.fusion-dev.net/',
          onProxyReq: proxyRequestLogger,
        },
        app: {
          key: appKey,
          version: String(pkg.packageJson.version),
          generateConfig,
          generateManifest,
          manifestPath: `persons/me/apps/${appKey}`,
        },
      }),
      // Proxy help assets request to help service.
      helpProxyPlugin({
        proxy: {
          path: '/help-proxy',
          target: 'https://help.ci.api.fusion-dev.net/',
          onProxyReq: proxyRequestLogger,
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
