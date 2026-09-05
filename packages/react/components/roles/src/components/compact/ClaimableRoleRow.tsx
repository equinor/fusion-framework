import type { ChangeEvent, ReactNode } from 'react';
import { Switch } from '@equinor/eds-core-react';
import type { RequiredRoleClaim } from '@equinor/fusion-framework-module-roles';
import type { ClaimableRoleDetails, RoleDetails } from '../overview/role-details';
import { CompactRoleRow } from './CompactRoleRow';
import { formatRoleDate } from './format-role-date';

/** Claimable assignment presentation and provider-backed interaction callbacks. */
interface ClaimableRoleRowProps {
  readonly role: ClaimableRoleDetails;
  readonly variant: 'available' | 'claimed' | 'expired';
  readonly isPending: boolean;
  readonly selectedAssignmentId?: string;
  readonly onShowInformation: (details: RoleDetails) => void;
  readonly onSelectClaim: (claim: RequiredRoleClaim) => void;
  readonly onDeactivate: (assignmentId: string) => Promise<void>;
}

/**
 * Presents a claimable assignment with audited activation controls outside the informational Active tab.
 * @param props - Assignment, tab presentation, selection, and mutation callbacks.
 * @returns A compact role row with an optional activation switch.
 */
export const ClaimableRoleRow = ({
  role,
  variant,
  isPending,
  selectedAssignmentId,
  onShowInformation,
  onSelectClaim,
  onDeactivate,
}: ClaimableRoleRowProps): ReactNode => {
  const status =
    variant === 'claimed'
      ? `Claimed${role.activeTo ? ` · Expires ${formatRoleDate(role.activeTo)}` : ''}`
      : variant === 'expired'
        ? `Expired ${formatRoleDate(role.activeTo)}`
        : undefined;
  const caption = `${role.name}${status ? ` · ${status}` : ''}`;
  const action = role.isActive ? 'Deactivate' : variant === 'expired' ? 'Re-activate' : 'Activate';

  /**
   * Routes activation through audit collection and deactivation through the shared provider.
   * @param event - Requested switch state.
   */
  const handleToggle = (event: ChangeEvent<HTMLInputElement>): void => {
    // Turning on an inactive entitlement must collect audit details before making a request.
    if (event.target.checked && !role.isActive) {
      onSelectClaim({
        assignmentId: role.assignmentId,
        name: role.name,
        displayName: role.displayName,
        description: role.description,
      });
      return;
    }
    // Deactivation ends the activation, not the underlying claimable entitlement.
    if (!event.target.checked && role.isActive) {
      void onDeactivate(role.assignmentId).catch(() => {
        // The provider exposes deactivateError in the overview banner. Consume the event promise
        // here so the visible failure does not also become an unhandled browser rejection.
      });
    }
  };

  return (
    <CompactRoleRow role={role} caption={caption} onShowInformation={onShowInformation}>
      {variant !== 'claimed' ? (
        <Switch
          aria-label={`${action} ${role.displayName}`}
          checked={role.isActive || selectedAssignmentId === role.assignmentId}
          disabled={isPending}
          onChange={handleToggle}
        />
      ) : null}
    </CompactRoleRow>
  );
};
