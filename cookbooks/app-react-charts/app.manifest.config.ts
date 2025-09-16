import { defineAppManifest } from '@equinor/fusion-framework-cli/app';

export default defineAppManifest(async () => {
  // Define your app manifest here
  return {
    appKey: 'cookbook-chart',
  };
});
