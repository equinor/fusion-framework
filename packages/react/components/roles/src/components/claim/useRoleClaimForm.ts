import { useEffect, useState } from 'react';
import type { RequiredRoleClaim } from '@equinor/fusion-framework-module-roles';

/** Audit-form inputs shared by normal activation and required-role recovery. */
export interface RoleClaimFormOptions {
  readonly claim?: RequiredRoleClaim;
  readonly defaultReason: string;
  readonly isClaiming: boolean;
  readonly onClaim: (assignmentId: string, reason: string, hours: number) => Promise<void>;
}

/** Editable audit details and submission state for the activation dialog. */
interface RoleClaimForm {
  readonly reason: string;
  readonly setReason: (reason: string) => void;
  readonly durationHours: number;
  readonly setDurationHours: (hours: number) => void;
  readonly isPending: boolean;
  readonly canSubmit: boolean;
  readonly claimError?: string;
  readonly submitClaim: () => Promise<void>;
}

/**
 * Owns audited activation state and presents rejected submissions without losing retry details.
 * @param options - Selected assignment, default audit reason, provider pending state, and submission.
 * @returns Editable fields, pending/error state, and a guarded submit callback.
 */
export const useRoleClaimForm = ({
  claim,
  defaultReason,
  isClaiming,
  onClaim,
}: RoleClaimFormOptions): RoleClaimForm => {
  const [reason, setReason] = useState(defaultReason);
  const [durationHours, setDurationHours] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimError, setClaimError] = useState<string>();
  const isPending = isClaiming || isSubmitting;

  useEffect(() => {
    // Selecting another assignment starts a fresh audit request, not a retry of the previous one.
    if (claim) {
      setReason(defaultReason);
      setDurationHours(2);
      setClaimError(undefined);
    }
  }, [claim, defaultReason]);

  /**
   * Submits audit details and keeps activation failures visible inside the modal.
   * @returns A settled submission after displaying any activation failure.
   */
  const submitClaim = async (): Promise<void> => {
    const normalizedReason = reason.trim();
    // Whitespace is not an audit reason, and a pending request must not be submitted twice.
    if (!claim || !normalizedReason || isPending) {
      return;
    }
    setIsSubmitting(true);
    setClaimError(undefined);
    try {
      await onClaim(claim.assignmentId, normalizedReason, durationHours);
    } catch {
      // React boundaries cannot catch event-handler promises. Retain the audit fields and expose
      // failure here for every entry point, including recovery without a RolesProvider overview.
      setClaimError('The role could not be activated. Try again or contact your administrator.');
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
    canSubmit: Boolean(claim) && !isPending && reason.trim().length > 0,
    claimError,
    submitClaim,
  };
};
