import { defineConfig, mergeConfig } from 'vitest/config';

import baseConfig from './vitest.config';

const ciConfig = defineConfig({
    test: {
        outputFile: 'vitest-report.json',
        reporters: ['json', 'verbose'],
    },
});

export default mergeConfig(baseConfig, ciConfig);
