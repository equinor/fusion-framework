import { defineAppManifest, mergeManifests } from '@equinor/fusion-framework-cli';

export default defineAppManifest((_env, { base }) => {
    return mergeManifests(base, {
        key: 'widget2',
        name: 'Widget 2',
    });
});
