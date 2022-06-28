import {
    AnyModule,
    initializeModules,
    ModulesInstanceType,
} from '@equinor/fusion-framework-module';

import type { ModulesConfigurator } from '@equinor/fusion-framework-module';

import http, { HttpModule } from '@equinor/fusion-framework-module-http';
import auth, { MsalModule } from '@equinor/fusion-framework-module-msal';
import disco, { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';

export type FusionModules = [HttpModule, MsalModule, ServiceDiscoveryModule];
export const baseModules: FusionModules = [http, auth, disco];

export type FusionModulesInstance<TModules extends Array<AnyModule>> =
    ModulesInstanceType<FusionModules> & ModulesInstanceType<TModules>;

export type FusionConfigurator<TModules extends Array<AnyModule>> = ModulesConfigurator<
    [...FusionModules, ...TModules]
>;

export const initializeFusionModules = async <TModules extends Array<AnyModule> = []>(
    configurator: FusionConfigurator<TModules>,
    modules?: TModules
): Promise<FusionModulesInstance<TModules>> =>
    // TODO - TS resolve overload, might fix later
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    initializeModules(configurator, [...baseModules, ...modules]);
