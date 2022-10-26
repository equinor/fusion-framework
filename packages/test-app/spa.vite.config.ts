import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import EnvironmentPlugin from 'vite-plugin-environment';

import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), EnvironmentPlugin({ NODE_ENV: 'development' })],
    build: {
        outDir: path.resolve(__dirname, 'lib'),
        // rollupOptions: {
        //     input: {
        //         'app-bundle': path.resolve(__dirname, 'src/App.tsx'),
        //     },
        //     output: {
        //         entryFileNames: `[name].js`,
        //     },
        // },
        lib: { entry: 'src/App.tsx', formats: ['es'], fileName: 'app-bundle' },
        minify: false,
    },
    // define: {
    //     'process.env': process.env
    // }
});
