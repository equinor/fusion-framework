import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';

import { enableContext } from '@equinor/fusion-framework-module-context';
import { enableBookmark } from '@equinor/fusion-framework-react-app/bookmark';

export const configure: AppModuleInitiator = (configurator) => {
    enableContext(configurator, async (builder) => {
        builder.setContextType(['projectMaster']); // set contextType to match against
    });
    enableBookmark(configurator);
};

export default configure;
