import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableContext } from '@equinor/fusion-framework-react-module-context';
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import buildQuery from 'odata-query';

export const configure: AppModuleInitiator = (configurator, conf) => {
    enableContext(configurator, async (builder) => {
        builder.setContextType(['projectmaster']); // set contextType to match against
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

    // include this line to enable navigation on ctx changes
    enableNavigation(configurator, conf.env.basename);
};

export default configure;
