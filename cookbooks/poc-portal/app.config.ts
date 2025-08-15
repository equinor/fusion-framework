import { defineAppConfig } from '@equinor/fusion-framework-cli/app';

export default defineAppConfig(() => ({
  environment: {
    apps: [
      {
        context: 'something',
        key: 'my-app',
      },
    ],
  },
}));
