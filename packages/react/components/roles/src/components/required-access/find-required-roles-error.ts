import { RequiredRolesError } from '@equinor/fusion-framework-module-roles/errors';

/**
 * Finds a required-role failure in an application host error chain.
 *
 * @param error - Error raised while the application or its modules initialize.
 * @returns The required-role error when access caused the render failure.
 */
export const findRequiredRolesError = (error: unknown): RequiredRolesError | undefined => {
  // The Roles module can fail directly or be wrapped by an application initialization error.
  if (RequiredRolesError.is(error)) {
    return error;
  }
  // Only Error-like objects can contribute another cause to inspect.
  if (typeof error !== 'object' || error === null || !('cause' in error)) {
    return undefined;
  }
  return findRequiredRolesError(error.cause);
};
