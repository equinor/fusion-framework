export { AppConfigurator, IAppConfigurator, AppConfiguratorConstructor } from './AppConfigurator';

export { configureModules, default } from './configure-modules';

export { AppConfiguratorError } from './error';

export {
  AppModulesConfiguredEvent,
  AppModulesInitializedEvent,
} from './events';

export {
  AppConfig,
  AppEnv,
  AppManifest,
  AppModuleInit,
  AppModuleInitArgs,
  AppModuleInitiator,
  AppModules,
  AppModulesInstance,
  AppRenderFn,
} from './types';

// TODO remove
export { configureModules as initAppModules } from './configure-modules';
