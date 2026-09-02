/**
 * Fusion Framework module for authenticated, typed Fusion Roles V2 access.
 *
 * @packageDocumentation
 */

export {
  type ClaimRoleInput,
  type IRolesClient,
  RolesClient,
} from './RolesClient.js';
export {
  type IRolesModuleConfigurator,
  RolesModuleConfigurator,
} from './RolesModuleConfigurator.js';
export { RoleClaimEvent, type RoleClaimEventInit } from './RoleClaimEvent.js';
export { RequiredRolesError } from './RequiredRolesError.js';
export { type IRolesProvider, RolesProvider } from './RolesProvider.js';
export type { RolesModuleConfig } from './types.js';
export {
  configureRoles,
  default,
  enableRoles,
  module as rolesModule,
  moduleKey,
  type RolesModule,
  type RolesModuleBuilderCallback,
} from './module.js';
