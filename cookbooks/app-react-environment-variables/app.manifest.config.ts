import { defineAppManifest, mergeManifests } from '@equinor/fusion-framework-cli';

export default defineAppManifest((env, { base }) => {
    return mergeManifests(base, {});
});
