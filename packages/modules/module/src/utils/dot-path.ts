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

type Decrement = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

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
