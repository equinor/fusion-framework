export {
    AppModuleConfig,
    AppConfigurator,
    IAppConfigurator,
    AppModuleConfig as IAppModuleConfig,
} from './AppConfigurator';
export { AppModuleProvider } from './AppModuleProvider';

export { App } from './app/App';

export * from './events';
export * from './types';

export { default, AppModule, module, moduleKey, enableAppModule } from './module';
