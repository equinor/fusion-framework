import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import dns from 'dns';

dns.setDefaultResultOrder('verbatim');

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        host: 'localhost',
        port: 3000,
    },
    plugins: [react()],
});
