import { createContext } from 'react';

import type {
  ActivateClaimableRoleAssignmentInput,
  DeactivateClaimableRoleAssignmentInput,
} from '@equinor/fusion-framework-module-roles';

export type {
  ActiveAccessRoleAssignments,
  ClaimableRoleAssignmentActivationResult,
  ClaimableRoleAssignmentDeactivationResult,
  ConsolidatedClaimableRoleAssignments,
  ConsolidatedRoleAssignments,
} from '../state/roles-state';
import type {
  ActiveAccessRoleAssignments,
  ClaimableRoleAssignmentActivationResult,
  ClaimableRoleAssignmentDeactivationResult,
  ConsolidatedClaimableRoleAssignments,
  ConsolidatedRoleAssignments,
} from '../state/roles-state';

/** Provider-scoped collection snapshots and stable actions shared by the public role hooks. */
export interface RolesContextValue {
  readonly activeAccessRoleAssignments: {
    readonly assignments: ActiveAccessRoleAssignments;
    readonly isLoading: boolean;
    readonly error: unknown;
    readonly reload: () => Promise<void>;
  };
  readonly consolidatedClaimableRoleAssignments: {
    readonly assignments: ConsolidatedClaimableRoleAssignments;
    readonly isLoading: boolean;
    readonly error: unknown;
    readonly reload: () => Promise<void>;
    readonly activateClaimableRoleAssignment: (
      input: ActivateClaimableRoleAssignmentInput,
    ) => Promise<ClaimableRoleAssignmentActivationResult>;
    readonly deactivateClaimableRoleAssignment: (
      input: DeactivateClaimableRoleAssignmentInput,
    ) => Promise<ClaimableRoleAssignmentDeactivationResult>;
    readonly isActivating: boolean;
    readonly activationError: unknown;
    readonly isDeactivating: boolean;
    readonly deactivationError: unknown;
  };
  readonly consolidatedRoleAssignments: {
    readonly assignments: ConsolidatedRoleAssignments;
    readonly isLoading: boolean;
    readonly error: unknown;
    readonly reload: () => Promise<void>;
  };
}

/**
 * Shares role-assignment collections and claimable-role-assignment mutation state beneath a
 * {@link RolesProvider}.
 */
export const RolesContext = createContext<RolesContextValue | undefined>(undefined);
