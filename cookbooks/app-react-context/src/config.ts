import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableContext } from '@equinor/fusion-framework-react-module-context';
// import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import buildQuery from 'odata-query';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const configure: AppModuleInitiator = (configurator, { env }) => {
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
    // include this line to enable navigation
    // enableNavigation(configurator, env.basename);
};

export default configure;
