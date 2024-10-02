import { defineAppConfig } from '@equinor/fusion-framework-cli';

export default defineAppConfig((_nev) => {
    return {
        endpoints: {
            api: {
                url: 'https://foo.bars',
            },
        },
    };
});
