import type { CombinedModules, ModulesInstance } from '@equinor/fusion-framework-module';
import type { AnyModule } from '@equinor/fusion-framework-module';

import { ContextModule } from '@equinor/fusion-framework-module-context';
import { EventModule } from '@equinor/fusion-framework-module-event';
import { HttpModule } from '@equinor/fusion-framework-module-http';
import { MsalModule } from '@equinor/fusion-framework-module-msal';
import { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';
import { ServicesModule } from '@equinor/fusion-framework-module-services';

export type FusionModules<TModules extends Array<AnyModule> | unknown = unknown> = CombinedModules<
    TModules,
    [ContextModule, EventModule, HttpModule, MsalModule, ServicesModule, ServiceDiscoveryModule]
>;

export type FusionModulesInstance<TModules extends Array<AnyModule> | unknown = unknown> =
    ModulesInstance<FusionModules<TModules>>;

export interface Fusion<TModules extends Array<AnyModule> | unknown = unknown> {
    /**
     * Configured services for Fusion
     */
    modules: FusionModulesInstance<TModules>;
}
