import { defineAppConfig } from '@equinor/fusion-framework-cli/app';

export default defineAppConfig(() => {
  return {
    endpoints: {
      api: {
        url: 'https://foo.bars',
      },
    },
  };
});
