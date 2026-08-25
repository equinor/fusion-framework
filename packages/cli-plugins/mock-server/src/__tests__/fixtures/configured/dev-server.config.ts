import { defineDevServerConfig } from '@equinor/fusion-framework-cli';

export default defineDevServerConfig((env) => ({
  mockServer: {
    path: `${env.environment}-api-mocks`,
    port: 4010,
    host: '127.0.0.1',
    seed: 42,
  },
}));
