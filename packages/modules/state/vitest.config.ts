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
    include: ['./src/__tests__/**/*.test.ts'], // Glob pattern to include test files
    name: `${name}@${version}`, // Naming the test suite with package name and version

    environment: 'happy-dom', // Use jsdom for browser-like environment
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
});
