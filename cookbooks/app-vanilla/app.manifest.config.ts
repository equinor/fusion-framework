import { defineAppManifest, mergeManifests } from '@equinor/fusion-framework-cli';

export default defineAppManifest((_env, { base }) =>
    mergeManifests(base, {
        key: 'vanilla',
    }),
);
