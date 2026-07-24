import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import type { AppEnv, IAppConfigurator, Fusion } from '@equinor/fusion-framework-react-app';

export const configure = (
  configurator: IAppConfigurator,
  args: { fusion: Fusion; env: AppEnv },
) => {
  enableNavigation(configurator, {
    configure: (config) => {
      config.setBasename(args.env.basename);
    },
  });
};

export default configure;
