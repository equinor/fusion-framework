import { defineAppManifest } from '@equinor/fusion-framework-cli';

export default defineAppManifest(async (env) => {
  return {
    appKey: 'test-assets',
  };
});
