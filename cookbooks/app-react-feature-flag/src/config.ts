import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import { enableFeatureFlagging } from '@equinor/fusion-framework-module-feature-flag';
import { enableCgiPlugin } from '@equinor/fusion-framework-module-feature-flag/plugins';

export const configure: AppModuleInitiator = (configurator, args) => {
    const { basename } = args.env;
    enableNavigation(configurator, basename);

    enableFeatureFlagging(configurator, (_builder) => {
        _builder.addPlugin(enableCgiPlugin('cookbook-feature-flag', ['foo', 'bar']));
    });
};

export default configure;
