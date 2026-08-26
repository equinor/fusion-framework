import { defineService } from '../../../discovery/define-service.js';

export default defineService({
  key: 'pet-store',
  serviceDiscovery: 'merge',
  components: {
    Pet: {
      name: 'person.fullName',
    },
  },
});
