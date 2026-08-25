import schema from './aurora-api.openapi.json' with { type: 'json' };

import { defineService } from '@equinor/fusion-openapi-mock-server/discovery';

/**
 * Models a backend that the application team must integrate with before the backend team has
 * registered it in Fusion service discovery.
 *
 * The mock owns a complete OpenAPI document because no upstream service definition exists yet.
 * `serviceDiscovery: 'new'` advertises the service during local development and fails on a key
 * collision, making an unexpected real registration visible instead of silently shadowing it.
 * Before releasing the application, register `aurora-api` in real service discovery and remove
 * this temporary local definition (or change the scenario to an intentional `'merge'` override).
 */
export default defineService({
  key: 'aurora-api',
  serviceDiscovery: 'new',
  schema,
  // Stabilize generated fields referenced by GET /forecast so browser assertions are deterministic.
  components: {
    AuroraForecast: {
      location: () => 'North Sea',
      activity: () => 'High',
    },
  },
});