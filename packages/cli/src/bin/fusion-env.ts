import type { ModulesInstance, AnyModule } from '@equinor/fusion-framework-module';
import type { AzureIdentityModule } from '@equinor/fusion-framework-module-azure-identity';
import type { HttpModule } from '@equinor/fusion-framework-module-http';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';

// Define the module types used in the framework instance
export type Modules = [AzureIdentityModule, HttpModule, ServiceDiscoveryModule];

/**
 * Type representing the initialized Fusion Framework instance.
 * This is a composition of the modules defined in the Modules tuple.
 */
export type FusionFramework<TExtra extends Array<AnyModule> = []> = ModulesInstance<
  [...Modules, ...TExtra]
>;

/**
 * Enum for supported Fusion environments.
 * Used to select the correct environment for service discovery and authentication.
 */
export enum FusionEnv {
  ContinuesIntegration = 'ci',
  QualityAssurance = 'fqa',
  Training = 'tr',
  Production = 'fprd',
  Development = 'dev',
}
