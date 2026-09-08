import { RequiredAccessRolesError } from '@equinor/fusion-framework-module-roles/errors';

/**
 * Finds a required-access-role failure in an application host error chain.
 *
 * @param error - Error raised while the application or its modules initialize.
 * @returns The required-access-role error when access caused the render failure.
 */
export const findRequiredAccessRolesError = (
  error: unknown,
): RequiredAccessRolesError | undefined => {
  // The Roles module can fail directly or be wrapped by an application initialization error.
  if (RequiredAccessRolesError.is(error)) {
    return error;
  }
  // Only Error-like objects can contribute another cause to inspect.
  if (typeof error !== 'object' || error === null || !('cause' in error)) {
    return undefined;
  }
  return findRequiredAccessRolesError(error.cause);
};
