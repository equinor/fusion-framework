import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { findUpSync } from 'find-up';

import { defineConfig, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';

const resolvePackage = () => {
    const pkgFile = findUpSync('package.json');
    if (!pkgFile) {
        throw Error('failed to resolve package');
    }
    const pkgRaw = readFileSync(pkgFile, 'utf8');
    return { root: dirname(pkgFile), pkg: JSON.parse(pkgRaw) };
};

export const createConfig = (): UserConfig => {
    const { root } = resolvePackage();
    return defineConfig({
        plugins: [react()],
        root: resolve(root, 'src'),
        server: {
            middlewareMode: true,
        },
        appType: 'custom',
        build: {
            outDir: resolve(root, 'dist'),
            lib: {
                entry: resolve(root, 'src/index.tsx'),
                fileName: 'app-bundle',
                formats: ['es'],
            },
        },
    }) as unknown as UserConfig;
};

export default createConfig;
