import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableBookmark } from '@equinor/fusion-framework-react-app/bookmark';
import { enableContext } from '@equinor/fusion-framework-module-context';

/**
 * Enables the app modules consumed by the dev portal Header test harness.
 */
export const configure: AppModuleInitiator = (configurator) => {
  enableContext(configurator, (builder) => {
    builder.setContextType(['ProjectMaster']);
  });
  enableBookmark(configurator);
};

export default configure;
