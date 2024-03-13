export type DotPath<TObject extends object> = {
    [Key in keyof TObject & string]: TObject[Key] extends CallableFunction
        ? never
        : TObject[Key] extends object
          ? `${Key}` | `${Key}.${DotPath<TObject[Key]>}`
          : `${Key}`;
}[keyof TObject & string];

export type DotPathType<TType, TPath extends string> = TPath extends keyof TType
    ? TType[TPath]
    : TPath extends `${infer K}.${infer R}`
      ? K extends keyof TType
          ? DotPathType<TType[K], R>
          : never
      : never;
