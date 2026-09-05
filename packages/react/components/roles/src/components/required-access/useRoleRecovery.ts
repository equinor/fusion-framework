import { useEffect, useMemo, useRef, useState } from 'react';
import type { RequiredRoleStatus } from '@equinor/fusion-framework-module-roles';
import { findRequiredRolesError } from './find-required-roles-error';

/** Required-access resolution and the app-scoped activation callback for the recovery view. */
interface RoleRecovery {
  readonly isRoleError: boolean;
  readonly isLoading: boolean;
  readonly statuses: readonly RequiredRoleStatus[];
  readonly statusError?: string;
  /** Whether a failed metadata read can be retried through the original provider. */
  readonly canRetryStatuses: boolean;
  /** Retries metadata locally without restarting the application or activating a role. */
  readonly retryStatuses: VoidFunction;
  readonly claimingAssignmentId?: string;
  readonly claimRole: (assignmentId: string, reason: string, hours: number) => Promise<void>;
}

/**
 * Resolves required-role recovery using the provider attached to the original application failure.
 * @param error - Failure raised while loading or rendering the application.
 * @param onRetry - Restarts the host only after successful activation.
 * @returns Required-role outcomes, metadata errors, local read retry, and activation recovery.
 */
export const useRoleRecovery = (error: Error, onRetry: VoidFunction): RoleRecovery => {
  const requiredRolesError = useMemo(() => findRequiredRolesError(error), [error]);
  const [attempt, setAttempt] = useState(0);
  const request = useMemo(() => ({ requiredRolesError, attempt }), [requiredRolesError, attempt]);
  const currentRequest = useRef<typeof request | undefined>(undefined);
  const [result, setResult] = useState<{
    readonly request: typeof request;
    readonly statuses?: RequiredRoleStatus[];
    readonly statusError?: string;
  }>();
  const [claim, setClaim] = useState<{
    readonly request: typeof request;
    readonly assignmentId: string;
  }>();

  useEffect(() => {
    const { requiredRolesError } = request;
    // Unrelated errors and legacy errors without a provider have no local read to retry.
    if (!requiredRolesError?.provider) {
      return;
    }

    let active = true;
    currentRequest.current = request;
    const provider = requiredRolesError.provider;
    // A synchronous provider failure needs the same local retry as a rejected metadata request.
    void Promise.resolve()
      .then(() => provider.getRequiredRoleStatuses(requiredRolesError.missingRoles))
      .then((nextStatuses) => {
        // Ignore a response from an error view replaced during navigation or retry.
        if (active) {
          setResult({ request, statuses: nextStatuses });
        }
      })
      .catch(() => {
        // Unknown metadata must remain a visible service failure, not a nonexistent-role verdict.
        if (active) {
          setResult({
            request,
            statusError: 'We could not check whether the required roles are available. Try again.',
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
    requiredRolesError && !requiredRolesError.provider
      ? 'The application Roles module cannot recover this role requirement.'
      : currentResult?.statusError;
  const canRetryStatuses = Boolean(requiredRolesError?.provider && statusError);

  /** Starts a fresh metadata read without invoking the host's activation-success callback. */
  const retryStatuses = (): void => {
    setAttempt((previous) => previous + 1);
  };

  /**
   * Activates a required role through the same provider that raised the missing-role error.
   * @param assignmentId - Claimable assignment identifier returned by Roles V2.
   * @param reason - User-provided audit reason.
   * @param hours - User-selected activation duration.
   * @returns Completion of activation and host retry dispatch.
   * @throws Activation errors for the claim dialog to display without retrying the host.
   */
  const claimRole = async (assignmentId: string, reason: string, hours: number): Promise<void> => {
    // Never substitute a global provider for the application scope that denied access.
    if (!requiredRolesError?.provider) {
      throw new Error('The application Roles module cannot recover this role requirement.');
    }
    setClaim({ request, assignmentId });
    try {
      await requiredRolesError.provider.claimRole({ roleId: assignmentId, reason, hours });
      // A completed activation for a replaced error must not restart the current application.
      if (currentRequest.current === request) {
        onRetry();
      }
    } finally {
      // The dialog owns rejected submissions; resetting pending must not turn failure into success.
      if (currentRequest.current === request) {
        setClaim(undefined);
      }
    }
  };

  return {
    isRoleError: Boolean(requiredRolesError),
    isLoading: Boolean(requiredRolesError && !currentResult && !statusError),
    statuses: currentResult?.statuses ?? [],
    statusError,
    canRetryStatuses,
    retryStatuses,
    claimingAssignmentId: claim?.request === request ? claim.assignmentId : undefined,
    claimRole,
  };
};
