/**
 * [[include:module-http/README.MD]]
 * @module
 */

export { IAppConfigConfigurator, AppConfigConfigurator } from './configurator';
export { IAppConfigProvider, AppConfigProvider } from './provider';
export {
    AppConfigModule,
    module as appConfigModule,
    moduleKey as appConfigModuleKey,
} from './module';
export type { AppConfig, AppConfigClient, Endpoint } from './types';

export { default } from './module';
