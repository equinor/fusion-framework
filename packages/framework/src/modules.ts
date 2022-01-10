import { initializeModules, ModulesInstanceType } from '@equinor/fusion-framework-module';

import type { ModulesConfigurator } from '@equinor/fusion-framework-module';

import http from '@equinor/fusion-framework-module-http';
import auth from '@equinor/fusion-framework-module-msal';

export const modules = [http, auth];

export type FusionModules = typeof modules;
export type FusionModulesInstance = ModulesInstanceType<FusionModules>;
export type FusionConfigurator = ModulesConfigurator<FusionModules>;

export const initializeFusionModules = async (
    configurator: FusionConfigurator
): Promise<FusionModulesInstance> => initializeModules(configurator, modules);
