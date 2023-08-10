import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        outputFile: 'test-report.json',
        // reporters: ['json'],
    },
});
