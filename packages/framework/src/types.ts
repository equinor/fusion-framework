import type { ModulesInstance } from '@equinor/fusion-framework-module';
import type { AnyModule } from '@equinor/fusion-framework-module';

import { AppModule } from '@equinor/fusion-framework-module-app';
import { ContextModule } from '@equinor/fusion-framework-module-context';
import { EventModule } from '@equinor/fusion-framework-module-event';
import { HttpModule } from '@equinor/fusion-framework-module-http';
import { MsalModule } from '@equinor/fusion-framework-module-msal';
import { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';

export type FusionModules<TModules extends Array<AnyModule> = []> = [
    ...TModules,
    AppModule,
    ContextModule,
    EventModule,
    HttpModule,
    MsalModule,
    ServiceDiscoveryModule,
];

export type FusionModulesInstance<TModules extends Array<AnyModule> = []> = ModulesInstance<
    FusionModules<TModules>
>;

export interface Fusion<TModules extends Array<AnyModule> = []> {
    /**
     * Configured services for Fusion
     */
    modules: FusionModulesInstance<TModules>;
}

export { AppManifest, AppConfig } from '@equinor/fusion-framework-module-app';
