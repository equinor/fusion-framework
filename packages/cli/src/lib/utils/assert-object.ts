import { assert } from './assert.js';

/**
 * Asserts that the provided value is an object.
 *
 * This function checks that the value has type 'object'. Note that
 * typeof null is 'object' in JavaScript, so null values will pass this check.
 *
 * @param value - The value to check for being an object
 * @param message - Optional custom error message or Error instance
 * @returns Nothing; narrows `value` via the `asserts` return type. Throws on failure.
 * @throws {AssertionError} If value is not an object
 *
 * @example
 * ```typescript
 * assertObject({}); // ✅ Passes
 * assertObject([]); // ✅ Passes
 * assertObject(null); // ✅ Passes (typeof null === 'object')
 * assertObject('string'); // ❌ Throws AssertionError
 * ```
 */
export function assertObject(value: object, message?: string | Error): asserts value {
  // typeof null is 'object', so this does not exclude null values
  assert(typeof value === 'object', message);
}
