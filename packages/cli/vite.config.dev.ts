import { mergeConfig } from 'vite';

import baseConfig from './vite.config';

export default mergeConfig(baseConfig, {
    build: {
        minify: false,
        terserOptions: {
            mangle: false,
        },
    },
    mode: 'development',
});
