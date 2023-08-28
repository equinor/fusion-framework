import { dirname } from 'node:path';

import { build } from 'vite';

import { chalk } from './utils/format.js';
import { Spinner } from './utils/spinner.js';
import { loadViteConfig } from './utils/load-vite-config.js';

import { resolveAppPackage } from '../lib/app-package.js';
import { type ConfigExecuterEnv } from '../lib/utils/config.js';

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

    spinner.info(
        '📦',
        chalk.yellowBright([pkg.packageJson.name, pkg.packageJson.version].join('@')),
    );

    const packageDirname = dirname(pkg.path);
    spinner.info(`🏠 ${chalk.blueBright(packageDirname)}`);

    const { viteConfig } = await loadViteConfig(env, {
        file: configSourceFiles?.vite,
    });

    if (library === 'react') {
        const reactPlugin = await import('@vitejs/plugin-react');
        viteConfig.plugins!.push(reactPlugin.default());
    }

    viteConfig.build.outDir = outDir.trim();

    const viteBuild = await build(viteConfig);

    return {
        viteConfig,
        viteBuild,
    };
};
