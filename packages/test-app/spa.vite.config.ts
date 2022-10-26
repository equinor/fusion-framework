import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import EnvironmentPlugin from 'vite-plugin-environment';

import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), EnvironmentPlugin({ NODE_ENV: 'development' })],
    build: {
        outDir: path.resolve(__dirname, 'lib'),
        lib: { entry: 'src/App.tsx', formats: ['es'], fileName: 'app-bundle' },
        minify: false,
    },
});
