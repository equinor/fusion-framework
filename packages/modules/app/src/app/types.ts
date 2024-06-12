import type { AppConfig, AppModulesInstance, AppScriptModule } from '../types';
import { ApplicationManifest } from '../helpers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppBundleState<TConfig = any, TModules = any> = {
    appKey: string;
    status: Set<string>;
    manifest?: ApplicationManifest;
    config?: AppConfig<TConfig>;
    modules?: AppScriptModule;
    instance?: AppModulesInstance<TModules>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppBundleStateInitial<TConfig = any, TModules = any> = Omit<
    AppBundleState<TConfig, TModules>,
    'status'
>;
