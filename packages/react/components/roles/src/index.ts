/**
 * Roles V2 recovery components for Fusion Framework React hosts.
 *
 * @packageDocumentation
 */

export {
  AccessRoleBoundary,
  type AccessRoleBoundaryProps,
} from './components/required-access/AccessRoleBoundary.js';
export { RolesView, type RolesViewProps } from './components/RolesView.js';
export { RolesProvider, type RolesProviderProps } from './context/RolesProvider.js';
export type {
  ActiveAccessRoleAssignments,
  ClaimableRoleAssignmentActivationResult,
  ClaimableRoleAssignmentDeactivationResult,
  ConsolidatedClaimableRoleAssignments,
  ConsolidatedRoleAssignments,
} from './context/roles-context.js';
export {
  useActiveAccessRoleAssignments,
  type UseActiveAccessRoleAssignmentsResult,
} from './hooks/useActiveAccessRoleAssignments.js';
export {
  useClaimableRoleAssignments,
  type UseClaimableRoleAssignmentsResult,
} from './hooks/useClaimableRoleAssignments.js';
export {
  useRoleAssignments,
  type UseRoleAssignmentsResult,
} from './hooks/useRoleAssignments.js';
