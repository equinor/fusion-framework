// demo
import { mergeAppConfigs, defineAppConfig } from '@equinor/fusion-framework-cli';
export default defineAppConfig((_nev, { base }) =>
    mergeAppConfigs(base, {
        environment: {},
        endpoints: {
            api: {
                url: 'https://foo.bars',
            },
        },
    }),
);
