/**
 * Roles V2 recovery components for Fusion Framework React hosts.
 *
 * @packageDocumentation
 */

export { RoleBoundary, type RoleBoundaryProps } from './components/required-access/RoleBoundary';
export { RolesView, type RolesViewProps } from './components/RolesView';
export { RolesProvider, type RolesProviderProps } from './context/RolesProvider';
export type {
  ActiveRoles,
  ClaimableRoles,
  RoleClaimResult,
  RoleDeactivateResult,
} from './context/roles-context';
export { useClaimableRoles, type UseClaimableRolesResult } from './hooks/useClaimableRoles';
export { useRoles, type UseRolesResult } from './hooks/useRoles';
