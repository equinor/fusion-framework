import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import { enableFeatureFlagging } from '@equinor/fusion-framework-module-feature-flag';
import { enableCgiPlugin } from '@equinor/fusion-framework-module-feature-flag/plugins';
import { faker } from '@faker-js/faker';

faker.seed(123);

export const configure: AppModuleInitiator = (configurator, args) => {
    const { basename } = args.env;
    enableNavigation(configurator, basename);

    enableFeatureFlagging(configurator, (_builder) => {
        _builder.addPlugin(
            enableCgiPlugin('cookbook-feature-flag', [
                'foo',
                {
                    key: faker.animal.type(),
                    readonly: true,
                },
                {
                    key: faker.animal.type(),
                    description: faker.lorem.sentence(5),
                    enabled: false,
                    value: faker.lorem.word(),
                },
                {
                    key: faker.animal.type(),
                    title: faker.animal.bear(),
                },
                {
                    key: faker.animal.type(),
                    title: faker.animal.bear(),
                    description: faker.lorem.sentence(5),
                    enabled: true,
                },
                {
                    key: faker.animal.type(),
                    enabled: false,
                    value: faker.lorem.word(),
                    readonly: true,
                },
            ]),
        );
    });
};

export default configure;
