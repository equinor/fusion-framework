import { defineAppManifest } from '@equinor/fusion-framework-cli/app';

export default defineAppManifest(async (_, { base }) => {
  return {
    ...base,
    appKey: 'test-assets',
  };
});
