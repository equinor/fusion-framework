import { initializeModules, ModulesInstanceType } from '@equinor/fusion-framework-module';

import type { ModulesConfigurator } from '@equinor/fusion-framework-module';

import http, { HttpModule } from '@equinor/fusion-framework-module-http';
import auth, { MsalModule } from '@equinor/fusion-framework-module-msal';
import disco, { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';

export type FusionModules = [HttpModule, MsalModule, ServiceDiscoveryModule];
export const modules: FusionModules = [http, auth, disco];

export type FusionModulesInstance = ModulesInstanceType<FusionModules>;
export type FusionConfigurator = ModulesConfigurator<FusionModules>;

export const initializeFusionModules = async (
    configurator: FusionConfigurator
): Promise<FusionModulesInstance> => initializeModules(configurator, modules);
