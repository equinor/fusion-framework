import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: path.resolve(__dirname, 'lib'),
        // entryFileNames: '[name].js',
        rollupOptions: {
            input: {
                'app-bundle': path.resolve(__dirname, 'src/App.tsx'),
            },
            output: {
                entryFileNames: `[name].js`
            }
        }
    }
});
