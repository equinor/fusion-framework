import { defineWidgetManifest, mergeWidgetManifests } from '@equinor/fusion-framework-cli';

export default defineWidgetManifest((env, { base }) => {
    if (env.command === 'serve') {
        return mergeWidgetManifests(base, {
            description: 'Just a test',
            entryPoint: 'src/Widget/index.ts',
            name: 'widget2',
            version: '0.0.0',
        });
    }
    return base;
});
