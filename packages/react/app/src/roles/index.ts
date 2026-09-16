/**
 * Roles V2 React hooks for Fusion Framework applications.
 *
 * @packageDocumentation
 */

export type {
  ActivateClaimableRoleAssignmentInput,
  RolesModule,
} from '@equinor/fusion-framework-module-roles';

export {
  useAccessRole,
  type ClaimableRoleAssignmentActivationResult,
  type UseAccessRoleResult,
} from './useAccessRole';
