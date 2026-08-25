import { defineAppConfig } from '@equinor/fusion-framework-cli/app';

/**
 * Supplies development-only endpoints that are not owned by Fusion service discovery.
 *
 * `my-api.mock.ts` uses `serviceDiscovery: false`, so neither the real discovery endpoint nor the
 * mock server's discovery response can configure this client. The explicit `<key>.localhost` URL
 * addresses that service directly on the manually started mock server. Production environments
 * would provide the app-owned API URL through their own environment-specific app config.
 */
export default defineAppConfig(() => ({
  endpoints: {
    'my-api': {
      url: 'http://my-api.localhost:4010',
    },
  },
}));