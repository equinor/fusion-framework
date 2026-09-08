/**
 * Fusion Framework module for authenticated, typed Fusion Roles V2 access.
 *
 * @packageDocumentation
 */

export {
  type ActivateClaimableRoleAssignmentInput,
  type DeactivateClaimableRoleAssignmentInput,
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
export {
  ClaimableRoleAssignmentActivationEvent,
  type ClaimableRoleAssignmentActivationEventInit,
} from './ClaimableRoleAssignmentActivationEvent.js';
export {
  ActivateClaimableRoleAssignmentError,
  DeactivateClaimableRoleAssignmentError,
  RequiredAccessRolesError,
  RolesError,
} from './errors/index.js';
export { type HasAccessRoleOptions, type IRolesProvider, RolesProvider } from './RolesProvider.js';
export type {
  RequiredAccessRoleClaimableAssignment,
  RequiredAccessRoleStatus,
} from './RequiredAccessRoleStatus.js';
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
