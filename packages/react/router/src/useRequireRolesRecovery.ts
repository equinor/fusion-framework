import { useCallback, useEffect, useState } from 'react';

import {
  RequireRolesRecovery,
  type RequireRolesRecoveryOperation,
  type RequireRolesRecoveryResult,
} from './RequireRolesRecovery.js';

/** Recovery progress: `idle` before a retry, `checking` while one runs, then its result. */
export type RequireRolesRecoveryStatus = 'idle' | 'checking' | RequireRolesRecoveryResult;

/** Recovery controls for a role-gate denial shown by a route error element. */
export interface RequireRolesRecoveryState {
  /** Denied operation that `retry` re-runs. */
  readonly operation: RequireRolesRecoveryOperation;
  /** Progress of the latest retry. */
  readonly status: RequireRolesRecoveryStatus;
  /**
   * Checks access again with `refresh: true` and re-runs the denied operation when access is
   * granted and the denial is still shown. Pass it as `RoleErrorView`'s `onRetry`, which calls it
   * only after the user activated a role assignment.
   */
  readonly retry: () => void;
}

/**
 * Connects a `requireRoles` denial to recovery from a route error element.
 *
 * Returns `undefined` for every other route error, including role-gate errors that are not
 * denials (`check-failed`, `not-configured`). Retries started by this hook are cancelled when the
 * error element unmounts or shows another error, so a late access check never re-runs an operation
 * the user already left.
 *
 * @param error - Value from `useRouteError()`.
 * @returns Recovery controls, or `undefined` when the error cannot be recovered by activation.
 *
 * @example
 * ```tsx
 * import { useRouteError } from 'react-router';
 * import { RoleErrorView } from '@equinor/fusion-framework-react-components-roles';
 * import { useRequireRolesRecovery } from '@equinor/fusion-framework-react-router';
 *
 * export const ErrorElement = () => {
 *   const error = useRouteError();
 *   const recovery = useRequireRolesRecovery(error);
 *   if (recovery && error instanceof Error) {
 *     return <RoleErrorView error={error} onRetry={recovery.retry} />;
 *   }
 *   return <p>Something went wrong.</p>;
 * };
 * ```
 */
export const useRequireRolesRecovery = (error: unknown): RequireRolesRecoveryState | undefined => {
  const recovery = RequireRolesRecovery.from(error);
  const [progress, setProgress] = useState<{
    readonly recovery: RequireRolesRecovery | undefined;
    readonly status: RequireRolesRecoveryStatus;
  }>({ recovery, status: 'idle' });
  const [controller, setController] = useState<AbortController>();

  // One abort controller per shown denial; unmounting or switching errors cancels its retries.
  useEffect(() => {
    // Errors without a recovery never start retries, so they own no controller.
    if (!recovery) {
      setController(undefined);
      return;
    }
    const next = new AbortController();
    setController(next);
    return () => next.abort();
  }, [recovery]);

  const retry = useCallback((): void => {
    // Retries require a mounted error element showing a recoverable denial.
    if (!recovery || !controller || controller.signal.aborted) {
      return;
    }
    const { signal } = controller;
    setProgress({ recovery, status: 'checking' });
    void recovery.retry(signal).then((status) => {
      // A successful retry usually unmounts this element; only report to a still-mounted owner.
      if (!signal.aborted) {
        setProgress({ recovery, status });
      }
    });
  }, [recovery, controller]);

  // Non-recoverable errors keep the application's own error UI.
  if (!recovery) {
    return undefined;
  }
  // Progress belongs to the denial it was recorded for; a new denial starts idle.
  const status = progress.recovery === recovery ? progress.status : 'idle';
  return { operation: recovery.operation, status, retry };
};

export default useRequireRolesRecovery;
