import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    root: fileURLToPath(new URL('./src/dev-portal', import.meta.url)),
    build: {
        outDir: fileURLToPath(new URL('./bin/dev-portal', import.meta.url)),
        emptyOutDir: true,
    },
});
