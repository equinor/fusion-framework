/**
 * Roles V2 React hooks for Fusion Framework applications.
 *
 * @packageDocumentation
 */

export type {
  ActivateClaimableRoleAssignmentInput,
  RolesModule,
} from '@equinor/fusion-framework-module-roles';

export { requireRoles, type RequireRolesOptions } from './require-roles.js';

export {
  useAccessRole,
  type ClaimableRoleAssignmentActivationResult,
  type UseAccessRoleResult,
} from './useAccessRole.js';

export {
  useHasAccessRole,
  type UseHasAccessRoleOptions,
  type UseHasAccessRoleResult,
} from './useHasAccessRole.js';
