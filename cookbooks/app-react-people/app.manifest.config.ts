import { defineAppManifest, mergeManifests } from '@equinor/fusion-framework-cli';

export default defineAppManifest((_env, { base }) => {
    return mergeManifests(base, {
        key: 'cookbook-people',
        name: 'cookbook-people',
    });
});
