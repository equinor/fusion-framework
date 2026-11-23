/**
 * Returns the type name of a thrown value, never its message or stack.
 *
 * @param error - Value that terminated the invocation.
 * @returns A plain identifier such as `TypeError`, or `Error` when no safe name exists.
 */
export const resolveExceptionType = (error: unknown): string => {
  // Primitive thrown values have no constructor name that is safe to inspect.
  if (error === null || typeof error !== 'object') return typeof error;
  const name = (error as { constructor?: { name?: unknown } }).constructor?.name;
  // Exclude arbitrary constructor text so only a bounded type identifier is exported.
  return typeof name === 'string' && /^[A-Za-z_$][\w$]{0,63}$/.test(name) ? name : 'Error';
};
