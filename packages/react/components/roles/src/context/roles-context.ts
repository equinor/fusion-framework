import { createContext } from 'react';

import type { ClaimRoleInput, DeactivateRoleInput } from '@equinor/fusion-framework-module-roles';

export type {
  ActiveRoles,
  ClaimableRoles,
  RoleClaimResult,
  RoleDeactivateResult,
} from '../state/roles-state';
import type {
  ActiveRoles,
  ClaimableRoles,
  RoleClaimResult,
  RoleDeactivateResult,
} from '../state/roles-state';

/** Provider-scoped collection snapshots and stable actions shared by the public role hooks. */
export interface RolesContextValue {
  readonly active: {
    readonly roles: ActiveRoles;
    readonly isLoading: boolean;
    readonly error: unknown;
    readonly reload: () => Promise<void>;
  };
  readonly claimable: {
    readonly roles: ClaimableRoles;
    readonly isLoading: boolean;
    readonly error: unknown;
    readonly reload: () => Promise<void>;
    readonly claimRole: (input: ClaimRoleInput) => Promise<RoleClaimResult>;
    readonly deactivateRole: (input: DeactivateRoleInput) => Promise<RoleDeactivateResult>;
    readonly isClaiming: boolean;
    readonly claimError: unknown;
    readonly isDeactivating: boolean;
    readonly deactivateError: unknown;
  };
}

/**
 * Shares role collection and activation state beneath a {@link RolesProvider}.
 */
export const RolesContext = createContext<RolesContextValue | undefined>(undefined);
