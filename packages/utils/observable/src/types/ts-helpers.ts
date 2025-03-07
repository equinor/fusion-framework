/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * return True if T is `any`, otherwise return False
 * taken from https://github.com/joonhocho/tsdef
 *
 */
export type IsAny<T, True, False = never> = true | false extends (T extends never ? true : false) // test if we are going the left AND right path in the condition
  ? True
  : False;

/**
 * return True if T is `unknown`, otherwise return False
 * taken from https://github.com/joonhocho/tsdef
 *
 */
export type IsUnknown<T, True, False = never> = unknown extends T ? IsAny<T, False, True> : False;

/**
 */
export type IfMaybeUndefined<P, True, False> = [undefined] extends [P] ? True : False;

/**
 */
export type IfVoid<P, True, False> = [void] extends [P] ? True : False;

/**
 */
export type IsUnknownOrNonInferrable<T, True, False> = IsUnknown<T, True, False>;

export type TypeGuard<T> = (value: any) => value is T;

// biome-ignore lint/complexity/noBannedTypes: This is a valid use case for an empty object type
export type NotFunction<T = unknown> = T extends Function ? never : T;

export type NestedKeys<TObject extends object> = {
  [Key in keyof TObject & string]: TObject[Key] extends CallableFunction
    ? never
    : TObject[Key] extends object
      ? `${Key}` | `${Key}.${NestedKeys<TObject[Key]>}`
      : `${Key}`;
}[keyof TObject & string];

export type NestedPropType<TType, TPath extends string> = TPath extends keyof TType
  ? TType[TPath]
  : TPath extends `${infer K}.${infer R}`
    ? K extends keyof TType
      ? NestedPropType<TType[K], R>
      : never
    : never;
