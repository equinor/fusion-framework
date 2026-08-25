import { defineService } from '@equinor/fusion-openapi-mock-server/discovery';

/**
 * Models an application that uses an existing Fusion service but needs deterministic local data.
 *
 * `people` already exists in the bundled `fusion` preset and in real service discovery, so this
 * module deliberately omits a schema and uses `'merge'`. The mock server inherits the existing
 * People API document, then replaces only the route needed by this cookbook. This keeps the local
 * contract aligned with the platform-owned service while making the UI and Playwright assertions
 * independent of live person data.
 */
export default defineService({
  key: 'people',
  serviceDiscovery: 'merge',
  routes: {
    '/persons/{azureId}': {
      get: {
        mock: {
          name: 'Jane Doe',
          mail: 'jane.doe@example.com',
          upn: 'jane.doe@example.com',
          accountType: 'Employee',
        },
      },
    },
  },
});