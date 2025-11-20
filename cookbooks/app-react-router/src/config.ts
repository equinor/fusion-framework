import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { createHistory, enableNavigation } from '@equinor/fusion-framework-module-navigation';

export const configure: AppModuleInitiator = (configurator, args) => {
  const { basename } = args.env;
  enableNavigation(configurator, {
    configure: (config) => {
      config.setBasename(basename);
      config.setHistory(createHistory('hash'));
    },
  });
};

export default configure;
