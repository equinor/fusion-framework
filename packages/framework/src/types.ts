import type { CombinedModules, ModulesInstance } from '@equinor/fusion-framework-module';
import type { AnyModule } from '@equinor/fusion-framework-module';

import type { ContextModule } from '@equinor/fusion-framework-module-context';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import type { HttpModule } from '@equinor/fusion-framework-module-http';
import type { MsalModule } from '@equinor/fusion-framework-module-msal';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';
import type { ServicesModule } from '@equinor/fusion-framework-module-services';
import type { TelemetryModule } from '@equinor/fusion-framework-module-telemetry';

/**
 * interface of the modules provided by Fusion Framework
 */
export type FusionModules<TModules extends Array<AnyModule> | unknown = unknown> = CombinedModules<
  TModules,
  [
    ContextModule,
    EventModule,
    HttpModule,
    MsalModule,
    ServicesModule,
    ServiceDiscoveryModule,
    TelemetryModule,
  ]
>;

/**
 * Blueprint of instance of framework modules
 */
export type FusionModulesInstance<TModules extends Array<AnyModule> | unknown = unknown> =
  ModulesInstance<FusionModules<TModules>>;

export interface Fusion<TModules extends Array<AnyModule> | unknown = unknown> {
  /**
   * Configured services for Fusion
   */
  modules: FusionModulesInstance<TModules>;
}
