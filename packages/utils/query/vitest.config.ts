import { defineProject } from 'vitest/config';

// Importing package name and version from package.json
import { name, version } from './package.json';

// Define and export the Vitest project configuration
export default defineProject({
    // Specify ESBuild options
    esbuild: {
        target: 'es2022', // Set the JavaScript target version for ESBuild
    },
    // Configure testing options
    test: {
        include: ['tests/**'], // Glob pattern to include test files
        name: `${name}@${version}`, // Naming the test suite with package name and version
        env: {
            NODE_ENV: 'development', // Set the environment to development for testing
            FUSION_LOG_LEVEL: '0', // Set the logging level for Fusion framework
        },
    },
});
