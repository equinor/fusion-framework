import type { AppEnv } from '@equinor/fusion-framework-app';

/**
 * The application environment used when a test does not care about its own app identity.
 */
export const defaultAppEnv: AppEnv = {
  manifest: {
    appKey: 'test-app',
    displayName: 'Test App',
    description: 'A test application',
    type: 'standalone',
  },
};
