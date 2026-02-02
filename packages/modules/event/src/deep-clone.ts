/**
 * Deep clones a value while preserving class instances and handling non-serializable values.
 * Functions are preserved as references. Circular references are handled via WeakMap.
 *
 * @template T - The type of the value to clone
 * @param value - The value to clone
 * @param seen - WeakMap to track circular references (internal use)
 * @returns A deep clone of the value
 */
export function deepClone<T>(value: T, seen = new WeakMap<object, object>()): T {
  // Handle primitives and null
  if (value === null || typeof value !== 'object') {
    return value;
  }

  // Functions are not cloned, keep the reference
  if (typeof value === 'function') {
    return value;
  }

  // Handle circular references
  if (seen.has(value)) {
    return seen.get(value) as T;
  }

  // Handle Date
  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  // Handle Array
  if (Array.isArray(value)) {
    const cloned: unknown[] = [];
    seen.set(value, cloned);
    for (let i = 0; i < value.length; i++) {
      cloned[i] = deepClone(value[i], seen);
    }
    return cloned as T;
  }

  // Handle plain objects and class instances
  const cloned: Record<string, unknown> = Object.create(Object.getPrototypeOf(value));
  seen.set(value, cloned);

  for (const key of Object.keys(value)) {
    const propValue = (value as Record<string, unknown>)[key];
    cloned[key] = deepClone(propValue, seen);
  }

  return cloned as T;
}
