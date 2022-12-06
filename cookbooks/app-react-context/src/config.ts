import type { AppModuleInitiator } from '@equinor/fusion-framework-app';
import { enableContext } from '@equinor/fusion-framework-react-module-context';
import buildQuery from 'odata-query';

export const configure: AppModuleInitiator = (configurator) => {
    enableContext(configurator, async (builder) => {
        builder.setContextType(['orgchart']); // set contextType to match against
        builder.setContextParameterFn(({ search, type }) => {
            return buildQuery({
                search,
                filter: {
                    type: {
                        in: type,
                    },
                },
            });
        });
    });
};

export default configure;
