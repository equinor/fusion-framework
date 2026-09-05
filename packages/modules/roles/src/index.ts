/**
 * Fusion Framework module for authenticated, typed Fusion Roles V2 access.
 *
 * @packageDocumentation
 */

export {
  type ClaimRoleInput,
  type DeactivateRoleInput,
  type IRolesClient,
  type RolesAccountResolver,
  RolesClient,
  type RolesClientInitializeOptions,
  type RolesReadOptions,
} from './RolesClient.js';
export {
  type IRolesModuleConfigurator,
  RolesModuleConfigurator,
} from './RolesModuleConfigurator.js';
export { RoleClaimEvent, type RoleClaimEventInit } from './RoleClaimEvent.js';
export {
  ClaimRoleError,
  DeactivateRoleError,
  RequiredRolesError,
  RolesError,
} from './errors/index.js';
export { type IRolesProvider, RolesProvider } from './RolesProvider.js';
export type { RequiredRoleClaim, RequiredRoleStatus } from './RequiredRoleStatus.js';
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
