import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import { enableFeatureFlagging } from '@equinor/fusion-framework-module-feature-flag';
import {
    createCgiPlugin,
    // createApiPlugin,
} from '@equinor/fusion-framework-module-feature-flag/plugins';
import { faker } from '@faker-js/faker';

faker.seed(123);

export const configure: AppModuleInitiator = (configurator, args) => {
    const { basename } = args.env;
    enableNavigation(configurator, basename);

    configurator.configureHttpClient('feature-flag-api', {
        baseUri: 'http://localhost:12321',
    });

    enableFeatureFlagging(configurator, (builder) => {
        builder.addPlugin(
            createCgiPlugin('cookbook-feature-flag', [
                'foo',
                {
                    key: faker.lorem.word(),
                    readonly: true,
                },
                {
                    key: faker.lorem.word(),
                    description: faker.lorem.sentence(5),
                    enabled: false,
                    value: faker.lorem.word(),
                },
                {
                    key: faker.lorem.word(),
                    title: faker.animal.bear(),
                },
                {
                    key: faker.lorem.word(),
                    title: faker.animal.bear(),
                    description: faker.lorem.sentence(5),
                    enabled: true,
                },
                {
                    key: faker.lorem.word(),
                    enabled: false,
                    value: faker.lorem.word(),
                    readonly: true,
                },
            ]),
        );

        // builder.addPlugin(
        //     createApiPlugin({
        //         httpClientName: 'feature-flag-api',
        //         path: 'api/flags',
        //     }),
        // );
    });
};

export default configure;