import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableAppState } from '@equinor/fusion-framework-react-app/state';

export const configure: AppModuleInitiator = (appConfigurator) => {
  enableAppState(appConfigurator);
};

export default configure;
