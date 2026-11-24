/**
 * Returns the type name of a thrown value, never its message or stack.
 *
 * @param error - Value that terminated the invocation.
 * @returns A plain identifier such as `TypeError`, or `Error` when no safe name exists.
 */
export const resolveExceptionType = (error: unknown): string => {
  // Primitive thrown values have no safe class name to report.
  if (error === null || typeof error !== 'object') return typeof error;
  const name = (error as { constructor?: { name?: unknown } }).constructor?.name;
  return typeof name === 'string' && /^[A-Za-z_$][\w$]{0,63}$/.test(name) ? name : 'Error';
};
