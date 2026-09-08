/**
 * Preserves domain failures while making rejected access-role checks renderable by React boundaries.
 * @param error - Rejection value from the provider or a descendant.
 * @returns An error suitable for the enclosing error boundary.
 */
export const toAccessRoleError = (error: unknown): Error =>
  error instanceof Error ? error : new Error('Access role check failed.', { cause: error });
