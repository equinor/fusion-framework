import { defineAppManifest } from '@equinor/fusion-framework-cli/app';

export default defineAppManifest((_, { base }) => {
  base.appKey = 'cookbook-header';
  base.displayName = 'Header Component Test';
});
