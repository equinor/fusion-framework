/**
 * Generates a union type of all possible dot-separated property paths within a given object type `TObject`.
 *
 * This utility type recursively traverses the object up to a specified depth (default: 5), producing string literal
 * types representing valid property access paths using dot notation. It handles both plain objects and arrays,
 * supporting nested structures.
 *
 * @typeParam TObject - The object type to generate dot-paths for.
 * @typeParam Depth - An array used to limit recursion depth (default: [1, 2, 3, 4, 5]).
 *
 * @example
 * type Example = {
 *   foo: {
 *     bar: string;
 *     baz: number;
 *   };
 *   arr: { id: number }[];
 * };
 *
 * // DotPath<Example> resolves to:
 * // "foo" | "foo.bar" | "foo.baz" | "arr" | "arr.0" | "arr.0.id" | "arr.1" | "arr.1.id" | ...
 */
// biome-ignore lint/suspicious/noExplicitAny: necessary
export type DotPath<TObject, Depth extends any[] = [1, 2, 3, 4, 5]> = Depth extends [
  infer _,
  ...infer Rest,
]
  ? TObject extends object
    ? // biome-ignore lint/suspicious/noExplicitAny: necessary
      TObject extends any[]
      ? `${number}` | `${number}.${DotPath<TObject[number], Rest>}`
      : {
          [Key in keyof Required<TObject> & string]: TObject[Key] extends object
            ?
                | `${Key}`
                | (TObject[Key] extends null | undefined
                    ? never
                    : `${Key}.${DotPath<NonNullable<TObject[Key]>, Rest>}`)
            : `${Key}`;
        }[keyof Required<TObject> & string]
    : never
  : never;

/**
 * Generates a union type of dot-separated property paths for a given type `T`.
 *
 * This utility type is useful for creating string literal types representing all possible
 * nested property paths within an object type, using dot notation.
 *
 * @typeParam T - The object type to generate dot-separated property paths for.
 * @see DotPath
 */
// biome-ignore lint/suspicious/noExplicitAny: necessary
export type DotPathUnion<T> = T extends any ? DotPath<T> : never;

/**
 * Resolves the type at a given dot-separated path within a nested object type.
 *
 * @template TType - The object type to traverse.
 * @template TPath - The dot-separated path string, constrained to valid paths of TType.
 *
 * @example
 * type Example = { a: { b: { c: number } } };
 * type Result = DotPathType<Example, 'a.b.c'>; // Result is number
 *
 * If the path does not exist in the object type, the result is `never`.
 */
// biome-ignore lint/suspicious/noExplicitAny: necessary
export type DotPathType<TType extends object, TPath extends DotPathUnion<TType>> = TType extends any
  ? TPath extends keyof TType
    ? TType[TPath]
    : TPath extends `${infer K}.${infer R}`
      ? K extends keyof TType
        ? R extends DotPathUnion<NonNullable<TType[K]>>
          ? DotPathType<NonNullable<TType[K]>, R>
          : never
        : never
      : never
  : never;
