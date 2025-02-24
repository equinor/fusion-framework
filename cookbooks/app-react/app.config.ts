import { defineAppConfig } from '@equinor/fusion-framework-cli';

export default defineAppConfig(() => {
  return {
    endpoints: {
      api: {
        url: 'https://foo.bars',
      },
    },
  };
});
