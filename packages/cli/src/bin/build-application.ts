import { dirname } from 'node:path';

import { build } from 'vite';

import { chalk } from './utils/format.js';
import { Spinner } from './utils/spinner.js';
import { loadViteConfig } from './utils/load-vite-config.js';
import { loadAppManifest } from './utils/load-manifest.js';

import { type ConfigExecuterEnv } from '../lib/utils/config.js';
import { resolveAppPackage } from '../lib/app-package.js';
import {
  AppAssetExportPlugin,
  createExtensionFilterPattern,
} from '../lib/plugins/app-assets/index.js';

export const buildApplication = async (options: {
  configSourceFiles?: {
    app?: string;
    manifest?: string;
    vite?: string;
  };
  outDir: string;
  library?: 'react';
}) => {
  const { configSourceFiles, library, outDir } = options;
  const env: ConfigExecuterEnv = {
    command: 'build',
    mode: process.env.NODE_ENV ?? 'production',
  };

  const spinner = Spinner.Global({ prefixText: chalk.dim('build') });

  spinner.start('resolve application package');
  const pkg = await resolveAppPackage();
  spinner.succeed();

  spinner.info('📦', chalk.yellowBright([pkg.packageJson.name, pkg.packageJson.version].join('@')));

  const packageDirname = dirname(pkg.path);
  spinner.info(`🏠 ${chalk.blueBright(packageDirname)}`);

  spinner.start('resolve application manifest');
  const { manifest } = await loadAppManifest(env, pkg, {
    file: configSourceFiles?.manifest,
  });
  spinner.succeed();

  const { viteConfig } = await loadViteConfig(env, {
    file: configSourceFiles?.vite,
  });

  const includeAssetsPattern = manifest.build?.allowedExtensions
    ? createExtensionFilterPattern(manifest.build.allowedExtensions)
    : undefined;

  spinner.info('📂', 'Using asset include filter:', chalk.red(includeAssetsPattern));

  viteConfig.plugins = [
    ...viteConfig.plugins,
    AppAssetExportPlugin({
      include: includeAssetsPattern,
    }),
  ];

  if (library === 'react') {
    const reactPlugin = await import('@vitejs/plugin-react');
    viteConfig.plugins!.push(reactPlugin.default());
  }

  viteConfig.build.outDir = outDir.trim();

  spinner.attachConsole = true;

  console.log('Building application...');

  const viteBuild = await build(viteConfig);

  spinner.attachConsole = false;

  return {
    viteConfig,
    viteBuild,
    pkg,
  };
};
