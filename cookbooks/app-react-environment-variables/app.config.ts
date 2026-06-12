import { defineAppConfig } from '@equinor/fusion-framework-cli/app';

export default defineAppConfig(() => {
  return {
    environment: {
      apiBaseUrl: 'https://api.example.com',
      features: {
        enableDarkMode: true,
        enableBetaFeatures: false,
      },
    },
  };
});
