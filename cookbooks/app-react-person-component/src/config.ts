import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';

export const configure: AppModuleInitiator = (configurator) => {
    configurator.useFrameworkServiceClient('people');
};

export default configure;
