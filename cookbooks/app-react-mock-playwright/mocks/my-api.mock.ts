import schema from './my-api.openapi.json' with { type: 'json' };

import { defineService } from '@equinor/fusion-openapi-mock-server/discovery';

/**
 * Models an app-owned API that is intentionally not registered in Fusion service discovery.
 *
 * The app supplies this endpoint directly in `app.config.dev.ts`, while this module supplies the
 * server behavior and OpenAPI contract. `serviceDiscovery: false` prevents the mock server from
 * advertising `my-api`; changing it to a discovery mode would teach the wrong production wiring
 * for a service whose URL is owned by application configuration.
 */
export default defineService({
  key: 'my-api',
  serviceDiscovery: false,
  schema,
  // Override the schema-generated field to make the visible greeting stable across test runs.
  components: {
    Greeting: {
      message: () => 'Hello from the mock server!',
    },
  },
});
