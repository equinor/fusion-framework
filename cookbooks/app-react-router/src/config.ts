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
  // Use current origin (includes protocol, host, and port) instead of hardcoded port
  configurator.configureHttpClient('products', {
    baseUri: window.location.origin,
  });
  configurator.configureHttpClient('users', {
    baseUri: window.location.origin,
  });
};

export default configure;
