import type { AppModuleInitiator } from '@equinor/fusion-framework-app';
import { enableContext } from '@equinor/fusion-framework-react-module-context';

export const configure: AppModuleInitiator = (configurator) => {
    enableContext(configurator, (builder) => {
        builder.setContextType(['orgchart']);
    });
};

export default configure;
