import schema from './pet-store.openapi.json' with { type: 'json' };

import { defineService } from '../../../discovery/define-service.js';

export default defineService({
  key: 'pet-store',
  serviceDiscovery: 'replace',
  schema,
  components: {
    Pet: {
      name: 'internet.userName',
    },
  },
  routes: {
    '/pets': {
      get: {
        status: 202,
        mock: [{ id: 'route-pet', name: 'Declarative route' }],
      },
    },
  },
  middleware: (router) => {
    router.get('/middleware', (_req, res) => {
      res.statusCode = 203;
      res.json({ source: 'middleware' });
    });
  },
});