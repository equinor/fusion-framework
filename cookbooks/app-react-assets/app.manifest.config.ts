import { defineAppManifest, mergeAppManifests } from '@equinor/fusion-framework-cli/app';

export default defineAppManifest((_, { base }) => {
  return mergeAppManifests(base, {
    appKey: 'test-assets',
  });
});
