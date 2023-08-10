import { defineConfig, mergeConfig } from 'vitest/config';

import baseConfig from './vitest.config';

const ciConfig = defineConfig({
    test: {
        outputFile: 'test-report.json',
        reporters: ['json'],
    },
});

export default mergeConfig(baseConfig, ciConfig);
