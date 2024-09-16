import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import viteEnv from 'vite-plugin-environment'; // Import the 'viteEnv' function from the appropriate module

import dns from 'dns';
dns.setDefaultResultOrder('verbatim');

export default defineConfig({
    plugins: [
        viteEnv({
            NODE_ENV: process.env.mode,
            FUSION_LOG_LEVEL:
                (process.env.FUSION_LOG_LEVEL ?? process.env.mode === 'development') ? '4' : '1',
        }),
    ],
    root: fileURLToPath(new URL('./src/portal', import.meta.url)),
    build: {
        outDir: fileURLToPath(new URL('./dev-portal', import.meta.url)),
        emptyOutDir: true,
        minify: false,
        terserOptions: {
            compress: false,
            mangle: false,
        },
    },
});
