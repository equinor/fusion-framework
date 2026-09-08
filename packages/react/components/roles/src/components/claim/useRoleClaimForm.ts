import { useEffect, useState } from 'react';

import type { ClaimableRoleAssignmentSelection } from '../overview/role-details';

/** Audit-form inputs shared by ordinary activation and required-access-role recovery. */
export interface RoleClaimFormOptions {
  readonly claimableRoleAssignment?: ClaimableRoleAssignmentSelection;
  readonly defaultReason: string;
  readonly isActivating: boolean;
  readonly onActivate: (assignmentId: string, reason: string, hours: number) => Promise<void>;
}

/** Editable audit details and submission state for the activation dialog. */
interface RoleClaimForm {
  readonly reason: string;
  readonly setReason: (reason: string) => void;
  readonly durationHours: number;
  readonly setDurationHours: (hours: number) => void;
  readonly isPending: boolean;
  readonly canSubmit: boolean;
  readonly activationError?: string;
  readonly submitActivation: () => Promise<void>;
}

/**
 * Owns audited activation state and presents rejected submissions without losing retry details.
 * @param options - Selected assignment, default audit reason, provider pending state, and submission.
 * @returns Editable fields, pending/error state, and a guarded submit callback.
 */
export const useRoleClaimForm = ({
  claimableRoleAssignment,
  defaultReason,
  isActivating,
  onActivate,
}: RoleClaimFormOptions): RoleClaimForm => {
  const [reason, setReason] = useState(defaultReason);
  const [durationHours, setDurationHours] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activationError, setActivationError] = useState<string>();
  const isPending = isActivating || isSubmitting;

  useEffect(() => {
    // Selecting another assignment starts a fresh audit request, not a retry of the previous one.
    if (claimableRoleAssignment) {
      setReason(defaultReason);
      setDurationHours(2);
      setActivationError(undefined);
    }
  }, [claimableRoleAssignment, defaultReason]);

  /**
   * Submits audit details and keeps activation failures visible inside the modal.
   * @returns A settled submission after displaying any activation failure.
   */
  const submitActivation = async (): Promise<void> => {
    const normalizedReason = reason.trim();
    // Whitespace is not an audit reason, and a pending request must not be submitted twice.
    if (!claimableRoleAssignment || !normalizedReason || isPending) {
      return;
    }
    setIsSubmitting(true);
    setActivationError(undefined);
    try {
      await onActivate(claimableRoleAssignment.assignmentId, normalizedReason, durationHours);
    } catch {
      // React boundaries cannot catch event-handler promises. Retain the audit fields and expose
      // failure here for every entry point, including recovery without a RolesProvider overview.
      setActivationError(
        'The claimable role assignment could not be activated. Try again or contact your administrator.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    reason,
    setReason,
    durationHours,
    setDurationHours,
    isPending,
    canSubmit: Boolean(claimableRoleAssignment) && !isPending && reason.trim().length > 0,
    activationError,
    submitActivation,
  };
};
