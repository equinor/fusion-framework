import assert, { AssertionError } from 'node:assert';

/**
 * Asserts that the provided value is a valid number (not NaN).
 *
 * This function checks that the value is not NaN, which is useful for
 * validating numeric inputs that might be strings or other types that
 * could convert to NaN.
 *
 * @param value - The value to check for being a valid number
 * @param message - Optional custom error message for assertion failure
 * @returns Nothing; narrows `value` via the `asserts` return type. Throws on failure.
 * @throws {AssertionError} If value is NaN
 *
 * @example
 * ```typescript
 * assertNumber(42); // ✅ Passes
 * assertNumber('42'); // ✅ Passes (string converts to number)
 * assertNumber(NaN); // ❌ Throws AssertionError
 * assertNumber('invalid'); // ❌ Throws AssertionError
 * ```
 */
export function assertNumber(value: unknown, message?: string): asserts value {
  // Ensure the value is not NaN; this does not check for type 'number'.
  assert(
    !Number.isNaN(value),
    new AssertionError({
      message,
      actual: value,
      expected: '<number>',
    }),
  );
}
