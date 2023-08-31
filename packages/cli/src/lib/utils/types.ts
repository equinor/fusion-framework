export type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U> ? Array<Value<U>> : Value<T[P]>;
};
type AllowedPrimitives =
    | boolean
    | string
    | number
    | Date /* add any types than should be considered as a value, say, DateTimeOffset */;
type Value<T> = T extends AllowedPrimitives ? T : RecursivePartial<T>;
