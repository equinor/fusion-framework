import { defineAppManifest } from '@equinor/fusion-framework-cli';

export default defineAppManifest(async (env) => {
    if (env.command === 'serve') {
        return {
            appKey: 'app-react',
        };
    }
});
