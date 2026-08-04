export { default as deepClone } from 'lodash.clonedeep';

/**
 * Utility type that makes all properties of an object deeply readonly.
 *
 * @typeParam T - The type to make deeply readonly.
 */
export type DeepImmutable<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepImmutable<T[P]> : T[P];
};

/**
 * Determines if the provided object is eligible to be frozen.
 *
 * Checks whether the input is a non-null object or array that is not already frozen.
 *
 * @param obj - The value to check for isMutable.
 * @returns True if the object is a non-null object or array and is not already frozen; otherwise, false.
 */
function isMutable(obj: unknown): obj is Record<string, unknown> | Array<unknown> {
  return typeof obj === 'object' && obj !== null && !Object.isFrozen(obj);
}

/**
 * Recursively applies Object.freeze to an object and all nested properties, making them immutable.
 *
 * @remarks
 * - Plain objects and arrays are deeply frozen.
 * - Does not handle circular references. Use with caution on complex object graphs.
 * - Symbol properties are not frozen.
 *
 * @template T - The type of the object to freeze.
 * @param obj - The object to deeply freeze.
 * @returns The deeply frozen (read-only) object.
 */
export function deepFreeze<T>(source: T): DeepImmutable<T> {
  // Skip primitives and objects already frozen to avoid unnecessary recursion.
  if (isMutable(source)) {
    // Arrays require traversing their values directly before freezing the container.
    if (Array.isArray(source)) {
      // Freeze every nested array value so the result is immutable at every depth.
      source.forEach(deepFreeze);
    } else {
      // Freeze every nested object value so the result is immutable at every depth.
      Object.values(source).forEach(deepFreeze);
    }
    Object.freeze(source);
  }
  return source;
}
