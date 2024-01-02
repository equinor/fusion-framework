import { defineAppManifest, mergeManifests } from '@equinor/fusion-framework-cli';

export default defineAppManifest((env, { base }) => {
    if (env.command === 'serve') {
        return mergeManifests(base, {
            key: 'msal',
        });
    }
    return base;
});
