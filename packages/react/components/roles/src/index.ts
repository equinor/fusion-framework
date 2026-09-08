/**
 * Roles V2 recovery components for Fusion Framework React hosts.
 *
 * @packageDocumentation
 */

export {
  AccessRoleBoundary,
  type AccessRoleBoundaryProps,
} from './components/required-access/AccessRoleBoundary';
export { RolesView, type RolesViewProps } from './components/RolesView';
export { RolesProvider, type RolesProviderProps } from './context/RolesProvider';
export type {
  ActiveAccessRoleAssignments,
  ClaimableRoleAssignmentActivationResult,
  ClaimableRoleAssignmentDeactivationResult,
  ConsolidatedClaimableRoleAssignments,
  ConsolidatedRoleAssignments,
} from './context/roles-context';
export {
  useActiveAccessRoleAssignments,
  type UseActiveAccessRoleAssignmentsResult,
} from './hooks/useActiveAccessRoleAssignments';
export {
  useClaimableRoleAssignments,
  type UseClaimableRoleAssignmentsResult,
} from './hooks/useClaimableRoleAssignments';
export {
  useRoleAssignments,
  type UseRoleAssignmentsResult,
} from './hooks/useRoleAssignments';
