// demo
import { mergeAppConfigs, defineAppConfig } from '@equinor/fusion-framework-cli';
export default defineAppConfig((_nev, { base }) =>
    mergeAppConfigs(base, {
        environment: {
            scope: 'foobar',
        },
        endpoints: {
            api: 'https://foo.bars',
        },
    }),
);
