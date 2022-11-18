import type { AppModuleInitiator } from '@equinor/fusion-framework-app';
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';

export const configure: AppModuleInitiator = (configurator, args) => {
    const { basename } = args.env;
    enableNavigation(configurator, basename);
};

export default configure;
