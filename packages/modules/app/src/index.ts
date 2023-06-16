export {
    AppModuleConfig,
    AppConfigurator,
    IAppConfigurator,
    AppModuleConfig as IAppModuleConfig,
} from './AppConfigurator';
export { AppModuleProvider } from './AppModuleProvider';

export { IApp } from './app/App';

export * from './events';
export * from './types';

export { enableAppModule } from './enable-app-module';

export { default, AppModule, module, moduleKey } from './module';
