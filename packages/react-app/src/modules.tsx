import { ModulesInstanceType } from '@equinor/fusion-framework-module';

import http, { HttpModule } from '@equinor/fusion-framework-module-http';
import msal, { MsalModule } from '@equinor/fusion-framework-module-msal';
import appConfig, { AppConfigModule } from '@equinor/fusion-framework-react-module-app-config';

import { useModules } from '@equinor/fusion-framework-react-module';

export type AppModules = [HttpModule, MsalModule, AppConfigModule];
export type AppModulesInstance = ModulesInstanceType<AppModules>;

export const appModules = [http, msal, appConfig];

export const useAppModules = useModules<AppModulesInstance>;
export const useAppModule = <TKey extends keyof AppModulesInstance>(
    module: TKey
): AppModulesInstance[TKey] => useAppModules()[module];
