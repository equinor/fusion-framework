// Nominal type tag for classes
// biome-ignore lint/suspicious/noExplicitAny: necessary
type OpaqueClass = new (...args: any[]) => any;

// Modify DotPath to stop at OpaqueClass
export type DotPath<TObject, Depth extends number = 5> = Depth extends 0
  ? never
  : TObject extends object
    ? // biome-ignore lint/suspicious/noExplicitAny: necessary
      TObject extends any[]
      ? `${number}` | `${number}.${DotPath<TObject[number], Decrement[Depth]>}`
      : {
          [Key in keyof Required<TObject> & string]: TObject[Key] extends object
            ?
                | `${Key}`
                | (TObject[Key] extends null | undefined
                    ? never
                    : `${Key}.${DotPath<NonNullable<TObject[Key]>, Decrement[Depth]>}`)
            : `${Key}`;
        }[keyof Required<TObject> & string]
    : never;

// The Decrement type array is used to control recursion depth in the DotPath utility.
// Each index represents the current depth, and the value at that index is the next depth.
// For example, at depth 5, the next depth is 4. This allows the utility to "count down"
// recursion levels until it reaches 0, at which point recursion stops.
// Extend this array if deeper recursion levels are needed in the future.
type Decrement = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

// DotPathUnion for unions
// biome-ignore lint/suspicious/noExplicitAny: necessary
export type DotPathUnion<T> = T extends any ? DotPath<T> : never;

// Type resolution for paths
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
