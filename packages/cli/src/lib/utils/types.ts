/**
 * Recursively makes all properties of a type optional, including nested objects and arrays.
 *
 * - For object types, all properties become optional and the transformation is applied deeply.
 * - For array properties, the transformation is applied to the array's element type.
 * - For primitive types and functions, the type is preserved as-is.
 *
 * This utility is useful for scenarios such as:
 *   - Creating deeply partial configuration objects (e.g., for overrides or patch updates)
 *   - Accepting partial user input for complex data structures
 *   - Safely merging deeply nested objects
 *
 * @template T - The type to make recursively partial.
 *
 * @example
 * // Simple object
 * type Foo = { a: number; b: { c: string } };
 * // RecursivePartial<Foo> is: { a?: number; b?: { c?: string } }
 *
 * // Object with array
 * type Bar = { items: { id: string; value: number }[] };
 * // RecursivePartial<Bar> is: { items?: Array<{ id?: string; value?: number }> }
 *
 * // Nested and mixed types
 * type Baz = { x: number; y: { z: { w: string[] } } };
 * // RecursivePartial<Baz> is: { x?: number; y?: { z?: { w?: string[] } } }
 *
 * // With primitives and functions
 * type Qux = { cb: () => void; flag: boolean; nested: { n: number } };
 * // RecursivePartial<Qux> is: { cb?: () => void; flag?: boolean; nested?: { n?: number } }
 *
 * @remarks
 * - RecursivePartial preserves the original type for primitives, functions, and Date objects.
 * - For union types, each member is transformed recursively.
 * - TypeScript's built-in Partial<T> only makes top-level properties optional; RecursivePartial applies this deeply.
 *
 * @see Partial
 * @see Value
 */
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U> ? Array<Value<U>> : Value<T[P]>;
};

// biome-ignore lint/suspicious/noExplicitAny: must allow any
type AnyFunction = (...args: any[]) => unknown;

/**
 * Represents the set of primitive types and commonly used types allowed in the framework.
 * Includes function types, booleans, strings, numbers, and Date objects.
 *
 * @remarks
 * - `AnyFunction` should be defined elsewhere as a type representing any function signature.
 * - Useful for constraining generic types or utility functions to a specific set of primitives.
 */
type AllowedPrimitives = AnyFunction | boolean | string | number | Date;

/**
 * Resolves to the type `T` if it extends `AllowedPrimitives`, otherwise recursively makes all properties of `T` optional.
 *
 * @typeParam T - The type to be evaluated.
 * @remarks
 * This utility type is useful for creating deeply partial versions of complex types,
 * while preserving primitive types as-is.
 */
type Value<T> = T extends AllowedPrimitives ? T : RecursivePartial<T>;
