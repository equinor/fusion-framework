/**
 * Preserves domain failures while making rejected access checks renderable by React boundaries.
 * @param error - Rejection value from the provider or a descendant.
 * @returns An error suitable for the enclosing error boundary.
 */
export const toRoleError = (error: unknown): Error =>
  error instanceof Error ? error : new Error('Role access check failed.', { cause: error });
