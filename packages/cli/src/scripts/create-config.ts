import { resolve } from 'path';

import { defineConfig, UserConfig, createLogger } from 'vite';
import react from '@vitejs/plugin-react';

import { resolvePackage } from './app-config.js';

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

export const createConfig = (): UserConfig => {
    const { root, pkg } = resolvePackage();
    return defineConfig({
        plugins: [react()],
        root: root,
        server: {
            middlewareMode: true,
        },
        mode: 'development',
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
