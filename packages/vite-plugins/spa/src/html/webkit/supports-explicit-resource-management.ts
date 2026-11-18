/**
 * Checks whether the browser supports native explicit resource management.
 *
 * @returns True when both explicit resource management features are available.
 */
export function supportsExplicitResourceManagement(): boolean {
  // Native resource scopes cannot dispose measurements when the symbol is absent.
  if (typeof Symbol.dispose !== 'symbol') {
    return false;
  }

  try {
    new Function('using resource = { [Symbol.dispose]() {} };');
    return true;
  } catch {
    return false;
  }
}
