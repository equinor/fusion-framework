import type { RolesMiddlewareMetadata } from './middleware-metadata/types.js';

/**
 * Why a `requireRoles` middleware stopped a route operation.
 *
 * - `denied`: the Roles provider answered and the requirement is not met. When the provider
 *   supplied recovery details, `cause` is its `RequiredAccessRolesError`.
 * - `check-failed`: the Roles provider could not answer (network, service or response failure).
 *   This is not a denial; access is unknown and the operation is stopped.
 * - `not-configured`: the Roles module is not enabled for the application. This is a
 *   configuration error, not a denial.
 */
export type RequireRolesErrorReason = 'denied' | 'check-failed' | 'not-configured';

/** Stable discriminator shared by copies of {@link RequireRolesError} in separate bundles. */
const requireRolesErrorType = 'RequireRolesError' as const;

/** Allowed reasons, used for structural recognition. */
const reasons: readonly RequireRolesErrorReason[] = ['denied', 'check-failed', 'not-configured'];

/**
 * Error thrown by `requireRoles` route middleware when it stops a navigation, fetcher, submission
 * or revalidation.
 *
 * It renders in the nearest route error boundary. The original provider error is kept as `cause`,
 * so access-recovery UI that looks for a Roles `RequiredAccessRolesError` in the cause chain can
 * offer claimable-role activation for `denied` errors.
 *
 * @example
 * ```tsx
 * import { RequireRolesError } from '@equinor/fusion-framework-react-router';
 *
 * export const ErrorElement = ({ error }: { error: unknown }) => {
 *   if (RequireRolesError.is(error) && error.reason === 'denied') {
 *     return <p>Missing access: {error.missingAccessRoles.join(', ')}</p>;
 *   }
 *   throw error;
 * };
 * ```
 */
export class RequireRolesError extends Error {
  /** Stable discriminator for {@link RequireRolesError.is}. */
  public static readonly Type = requireRolesErrorType;

  /** Identifies this error across bundle copies. */
  public readonly type = requireRolesErrorType;

  /**
   * Determines whether an unknown value is a {@link RequireRolesError}.
   *
   * @param error - Value caught by a route error boundary.
   * @returns True when the value structurally identifies a required-role middleware error.
   */
  public static is(error: unknown): error is RequireRolesError {
    // Structural discrimination keeps working when app and host bundle separate class copies.
    if (typeof error !== 'object' || error === null) {
      return false;
    }
    const candidate = error as Record<PropertyKey, unknown>;
    return (
      candidate.type === requireRolesErrorType &&
      typeof candidate.message === 'string' &&
      reasons.includes(candidate.reason as RequireRolesErrorReason) &&
      typeof candidate.requirement === 'object' &&
      candidate.requirement !== null &&
      Array.isArray(candidate.missingAccessRoles)
    );
  }

  /**
   * Creates a required-role middleware error.
   *
   * @param reason - Why the operation was stopped.
   * @param requirement - Normalized requirement declared by the middleware.
   * @param missingAccessRoles - Access roles reported missing by the provider; empty unless denied.
   * @param options - Standard error options carrying the provider error as `cause`.
   */
  constructor(
    public readonly reason: RequireRolesErrorReason,
    public readonly requirement: RolesMiddlewareMetadata,
    public readonly missingAccessRoles: readonly string[] = [],
    options?: ErrorOptions,
  ) {
    super(RequireRolesError.describe(reason, requirement), options);
    this.name = 'RequireRolesError';
  }

  /**
   * Builds an actionable message for the given outcome.
   *
   * @param reason - Why the operation was stopped.
   * @param requirement - Normalized requirement declared by the middleware.
   * @returns Human-readable error message.
   */
  private static describe(
    reason: RequireRolesErrorReason,
    requirement: RolesMiddlewareMetadata,
  ): string {
    const quantifier = requirement.mode === 'all' ? 'all of' : 'one of';
    const roles = requirement.roles.join(', ');
    // Each reason tells the reader what to do next: request access, retry later, or fix config.
    switch (reason) {
      case 'denied':
        return `Access denied: this route requires ${quantifier} the access roles ${roles}.`;
      case 'check-failed':
        return `Could not verify the access roles required by this route (${quantifier} ${roles}). Access is unknown, so the route was not loaded.`;
      case 'not-configured':
        return `requireRoles: the Roles module is not configured, so the access roles required by this route (${quantifier} ${roles}) cannot be checked. Enable it with enableRoles(configurator) in the app configuration.`;
    }
  }
}

export default RequireRolesError;
