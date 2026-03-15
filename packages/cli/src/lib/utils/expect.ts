import assert from 'node:assert';

/**
 * Lightweight assertion helper that provides a fluent API for value checks.
 *
 * Returns an object with `toBe` and `toBeInstanceOf` methods for asserting
 * equality and type, respectively. Intended for internal CLI validation logic.
 *
 * @template T - The type of the value being asserted.
 * @param value - The value to assert against.
 * @returns An object with `toBe` and `toBeInstanceOf` assertion methods.
 *
 * @example
 * ```ts
 * expect(status).toBe(200, 'expected HTTP 200');
 * expect(result).toBeInstanceOf('object', 'expected an object');
 * ```
 */
export const expect = <T>(value: T) => {
  return {
    toBe: (expected: T, message: string): asserts expected => {
      assert(
        value === expected,
        Error(message, {
          cause: {
            expected,
            actual: value,
            value,
          },
        }),
      );
      return this;
    },
    toBeInstanceOf: (expected: typeof value, message: string): asserts expected => {
      const actual = typeof value;
      assert(
        actual === expected,
        Error(message, {
          cause: {
            expected,
            actual,
            value: value === undefined ? 'undefined' : value,
          },
        }),
      );
      return this;
    },
  };
};
