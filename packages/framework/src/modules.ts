import {
    AnyModule,
    initializeModules,
    ModulesInstanceType,
} from '@equinor/fusion-framework-module';

import type { ModulesConfigurator } from '@equinor/fusion-framework-module';

import event, { EventModule } from '@equinor/fusion-framework-module-event';
import http, { HttpModule } from '@equinor/fusion-framework-module-http';
import auth, { MsalModule } from '@equinor/fusion-framework-module-msal';
import disco, { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';

export type FusionModules = [EventModule, HttpModule, MsalModule, ServiceDiscoveryModule];
export const baseModules: FusionModules = [event, http, auth, disco];

export type FusionModulesInstance<TModules extends Array<AnyModule>> =
    ModulesInstanceType<FusionModules> & ModulesInstanceType<TModules> & { dispose: VoidFunction };

export type FusionConfigurator<TModules extends Array<AnyModule>> = ModulesConfigurator<
    [...FusionModules, ...TModules]
>;

export const initializeFusionModules = <TModules extends Array<AnyModule> = []>(
    configurator: FusionConfigurator<TModules>,
    modules?: TModules
): Promise<FusionModulesInstance<TModules>> =>
    initializeModules(
        configurator,
        baseModules.concat(modules || []) as [...FusionModules, ...TModules]
        // TODO - fix typing
    ) as unknown as Promise<FusionModulesInstance<TModules>>;
