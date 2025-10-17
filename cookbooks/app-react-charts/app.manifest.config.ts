import { defineAppManifest } from '@equinor/fusion-framework-cli/app';

export default defineAppManifest((_env, { base }) => {
  return {
    ...base,
    appKey: 'cookbook-chart',
    displayName: 'Cookbook Chart',
    description: 'Fusion cookbook demonstrating chart integration',
  };
});
