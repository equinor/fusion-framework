import { defineDevServerConfig, processServices  } from '@equinor/fusion-framework-cli/dev-server';

// Fully typed configuration
export default defineDevServerConfig(() => {
  return {
    api: {
      processServices: (data, args) => {
        const existingServices = processServices(data, args);

        existingServices.data.push({
          key: 'metrics',
          name: 'Metrics Service',
          uri: '0.0.0.0:4318',
        });

        return existingServices;
      }
    }
  };
});
