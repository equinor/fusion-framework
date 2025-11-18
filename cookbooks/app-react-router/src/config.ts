import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import type { AppEnv, IAppConfigurator, Fusion } from '@equinor/fusion-framework-react-app';

export const configure = (
  configurator: IAppConfigurator,
  args: { fusion: Fusion; env: AppEnv },
) => {
  const { basename } = args.env;
  enableNavigation(configurator, {
    configure: (config) => {
      config.setBasename(basename);
    },
  });

  configurator.useFrameworkServiceClient('people');
  configurator.configureHttpClient('products', {
    baseUri: 'http://localhost:3000',
  });
  configurator.configureHttpClient('users', {
    baseUri: 'http://localhost:3000',
  });
};

export default configure;
