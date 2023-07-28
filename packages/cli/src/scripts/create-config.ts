import { resolve } from 'path';

import { defineConfig, createLogger, type UserConfig } from 'vite';

import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

import { resolvePackage } from './app-config.js';

import EnvironmentPlugin from 'vite-plugin-environment';

type CreateConfigOptions = { mode: 'production' | 'development' };

const createCustomLogger = () => {
    const logger = createLogger();
    const originalWarning = logger.warn;
    logger.warn = (msg, options) => {
        /** import of app file from framework */
        if (
            msg.includes('import(manifest.entry)') &&
            msg.includes('dynamic-import-vars#limitations')
        )
            return;
        originalWarning(msg, options);
    };
    return logger;
};

export const loadCustomConfig = async (file: string) => {
    const filePath = resolve(process.cwd(), file);
    return (await import(filePath)).default;
};

export const createConfig = (opt?: CreateConfigOptions): UserConfig => {
    const { mode } = opt ?? { mode: 'development' };
    const { root, pkg } = resolvePackage();
    return defineConfig({
        plugins: [
            react(),
            tsconfigPaths(),
            EnvironmentPlugin({
                NODE_ENV: mode,
            }),
        ],
        root: root,
        server: {
            middlewareMode: true,
        },
        appType: 'custom',
        build: {
            outDir: resolve(root, 'dist'),
            lib: {
                entry: resolve(root, pkg.main),
                fileName: 'app-bundle',
                formats: ['es'],
            },
        },
        customLogger: createCustomLogger(),
    }) as unknown as UserConfig;
};

export default createConfig;
