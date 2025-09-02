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
 * @typeParam T - The type of the object to freeze.
 * @param obj - The object to deeply freeze.
 * @returns The deeply frozen (read-only) object.
 */
export function deepFreeze<T>(source: T): DeepImmutable<T> {
  if (isMutable(source)) {
    if (Array.isArray(source)) {
      source.forEach(deepFreeze);
    } else {
      Object.values(source).forEach(deepFreeze);
    }
    Object.freeze(source);
  }
  return source;
}
