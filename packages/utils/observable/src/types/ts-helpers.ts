/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Returns `True` if `T` is `any`, otherwise returns `False`.
 *
 * @see https://github.com/joonhocho/tsdef
 */
export type IsAny<T, True, False = never> = true | false extends (T extends never ? true : false) // test if we are going the left AND right path in the condition
  ? True
  : False;

/**
 * Returns `True` if `T` is `unknown`, otherwise returns `False`.
 *
 * @see https://github.com/joonhocho/tsdef
 */
export type IsUnknown<T, True, False = never> = unknown extends T ? IsAny<T, False, True> : False;

/**
 * Conditional type: resolves to `True` if `P` might be `undefined`, otherwise `False`.
 */
export type IfMaybeUndefined<P, True, False> = [undefined] extends [P] ? True : False;

/**
 * Conditional type: resolves to `True` if `P` is `void`, otherwise `False`.
 */
export type IfVoid<P, True, False> = [void] extends [P] ? True : False;

/**
 * Conditional type: resolves to `True` if `T` is `unknown` or non-inferrable, otherwise `False`.
 */
export type IsUnknownOrNonInferrable<T, True, False> = IsUnknown<T, True, False>;

/**
 * A type predicate function signature for narrowing values to type `T`.
 */
export type TypeGuard<T> = (value: any) => value is T;

/**
 * Utility type that excludes function types from `T`.
 * Used to prevent state types from being confused with lazy initialiser functions.
 */
// biome-ignore lint/complexity/noBannedTypes: This is a valid use case for an empty object type
export type NotFunction<T = unknown> = T extends Function ? never : T;

/**
 * Recursively extracts all dot-separated key paths from an object type.
 *
 * @template TObject - The source object type.
 *
 * @example
 * ```ts
 * type Keys = NestedKeys<{ a: { b: { c: string } } }>; // 'a' | 'a.b' | 'a.b.c'
 * ```
 */
export type NestedKeys<TObject extends object> = {
  [Key in keyof TObject & string]: TObject[Key] extends CallableFunction
    ? never
    : TObject[Key] extends object
      ? `${Key}` | `${Key}.${NestedKeys<TObject[Key]>}`
      : `${Key}`;
}[keyof TObject & string];

/**
 * Resolves the type of a nested property in `TType` given a dot-separated
 * path string `TPath`.
 *
 * @template TType - The source object type.
 * @template TPath - A dot-separated key path.
 *
 * @example
 * ```ts
 * type Name = NestedPropType<{ a: { b: string } }, 'a.b'>; // string
 * ```
 */
export type NestedPropType<TType, TPath extends string> = TPath extends keyof TType
  ? TType[TPath]
  : TPath extends `${infer K}.${infer R}`
    ? K extends keyof TType
      ? NestedPropType<TType[K], R>
      : never
    : never;
