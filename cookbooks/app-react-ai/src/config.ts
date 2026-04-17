import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableAI, type AIModule } from '@equinor/fusion-framework-module-ai';

export const configure: AppModuleInitiator<[AIModule]> = (configurator) => {
  enableAI(configurator);
};

export default configure;
