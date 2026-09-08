import { useEffect, useMemo, useRef, useState } from 'react';
import type { RequiredAccessRoleStatus } from '@equinor/fusion-framework-module-roles';
import { findRequiredAccessRolesError } from './find-required-access-roles-error';

/**
 * Required-access-role resolution and the app-scoped activation callback for the recovery view.
 */
interface RequiredAccessRoleRecovery {
  readonly isRequiredAccessRolesError: boolean;
  readonly isLoading: boolean;
  readonly statuses: readonly RequiredAccessRoleStatus[];
  readonly statusError?: string;
  /** Whether a failed metadata read can be retried through the original provider. */
  readonly canRetryStatuses: boolean;
  /** Retries metadata locally without restarting the application or activating an assignment. */
  readonly retryStatuses: VoidFunction;
  readonly activatingAssignmentId?: string;
  readonly activateClaimableRoleAssignment: (
    assignmentId: string,
    reason: string,
    hours: number,
  ) => Promise<void>;
}

/**
 * Resolves required-access-role recovery using the provider attached to the original failure.
 * @param error - Failure raised while loading or rendering the application.
 * @param onRetry - Restarts the host only after successful activation.
 * @returns Required-access-role outcomes, metadata errors, local read retry, and activation recovery.
 */
export const useRequiredAccessRoleRecovery = (
  error: Error,
  onRetry: VoidFunction,
): RequiredAccessRoleRecovery => {
  const requiredAccessRolesError = useMemo(() => findRequiredAccessRolesError(error), [error]);
  const [attempt, setAttempt] = useState(0);
  const request = useMemo(
    () => ({ requiredAccessRolesError, attempt }),
    [requiredAccessRolesError, attempt],
  );
  const currentRequest = useRef<typeof request | undefined>(undefined);
  const [result, setResult] = useState<{
    readonly request: typeof request;
    readonly statuses?: RequiredAccessRoleStatus[];
    readonly statusError?: string;
  }>();
  const [activation, setActivation] = useState<{
    readonly request: typeof request;
    readonly assignmentId: string;
  }>();

  useEffect(() => {
    const { requiredAccessRolesError } = request;
    // Unrelated errors and legacy errors without a provider have no local read to retry.
    if (!requiredAccessRolesError?.provider) {
      return;
    }

    let active = true;
    currentRequest.current = request;
    const provider = requiredAccessRolesError.provider;
    // A synchronous provider failure needs the same local retry as a rejected metadata request.
    void Promise.resolve()
      .then(() =>
        provider.getRequiredAccessRoleStatuses(requiredAccessRolesError.missingAccessRoles),
      )
      .then((nextStatuses) => {
        // Ignore a response from an error view replaced during navigation or retry.
        if (active) {
          setResult({ request, statuses: nextStatuses });
        }
      })
      .catch(() => {
        // Unknown metadata must remain a visible service failure, not a nonexistent-access-role verdict.
        if (active) {
          setResult({
            request,
            statusError:
              'We could not check whether the required access roles are available. Try again.',
          });
        }
      });
    return () => {
      active = false;
      currentRequest.current = undefined;
    };
  }, [request]);

  // Never render another error's metadata or retain a failed result during a local retry.
  const currentResult = result?.request === request ? result : undefined;
  const statusError =
    requiredAccessRolesError && !requiredAccessRolesError.provider
      ? 'The application Roles module cannot recover this access-role requirement.'
      : currentResult?.statusError;
  const canRetryStatuses = Boolean(requiredAccessRolesError?.provider && statusError);

  /** Starts a fresh metadata read without invoking the host's activation-success callback. */
  const retryStatuses = (): void => {
    setAttempt((previous) => previous + 1);
  };

  /**
   * Activates a claimable role assignment through the same provider that raised the
   * missing-access-role error.
   * @param assignmentId - Claimable role assignment identifier returned by Roles V2.
   * @param reason - User-provided audit reason.
   * @param hours - User-selected activation duration.
   * @returns Completion of activation and host retry dispatch.
   * @throws Activation errors for the claim dialog to display without retrying the host.
   */
  const activateClaimableRoleAssignment = async (
    assignmentId: string,
    reason: string,
    hours: number,
  ): Promise<void> => {
    // Never substitute a global provider for the application scope that denied access.
    if (!requiredAccessRolesError?.provider) {
      throw new Error('The application Roles module cannot recover this access-role requirement.');
    }
    setActivation({ request, assignmentId });
    try {
      await requiredAccessRolesError.provider.activateClaimableRoleAssignment({
        assignmentId,
        reason,
        hours,
      });
      // A completed activation for a replaced error must not restart the current application.
      if (currentRequest.current === request) {
        onRetry();
      }
    } finally {
      // The dialog owns rejected submissions; resetting pending must not turn failure into success.
      if (currentRequest.current === request) {
        setActivation(undefined);
      }
    }
  };

  return {
    isRequiredAccessRolesError: Boolean(requiredAccessRolesError),
    isLoading: Boolean(requiredAccessRolesError && !currentResult && !statusError),
    statuses: currentResult?.statuses ?? [],
    statusError,
    canRetryStatuses,
    retryStatuses,
    activatingAssignmentId: activation?.request === request ? activation.assignmentId : undefined,
    activateClaimableRoleAssignment,
  };
};
