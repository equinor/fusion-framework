type Key = string | number | symbol;

type Join<L extends Key | undefined, R extends Key | undefined> = L extends string | number
    ? R extends string | number
        ? `${L}.${R}`
        : L
    : R extends string | number
    ? R
    : undefined;

type Union<L extends unknown | undefined, R extends unknown | undefined> = L extends undefined
    ? R extends undefined
        ? undefined
        : R
    : R extends undefined
    ? L
    : L | R;

// Use this type to define object types you want to skip (no path-scanning)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ObjectsToIgnore = { new (...parms: any[]): any } | Date | Array<any>;

type ValidObject<T> = T extends object ? (T extends ObjectsToIgnore ? false & 1 : T) : false & 1;

export type DotPath<
    T extends object,
    Prev extends Key | undefined = undefined,
    Path extends Key | undefined = undefined,
    PrevTypes extends object = T,
> = string &
    {
        [K in keyof T]: T[K] extends PrevTypes | T // T[K] is a type alredy checked?
            ? //  Return all previous paths.
              Union<Union<Prev, Path>, Join<Path, K>>
            : // T[K] is an object?.
            Required<T>[K] extends ValidObject<Required<T>[K]>
            ? // Continue extracting
              DotPath<Required<T>[K], Union<Prev, Path>, Join<Path, K>, PrevTypes | T>
            : // Return all previous paths, including current key.
              Union<Union<Prev, Path>, Join<Path, K>>;
    }[keyof T];

export type DotPathType<T, Path extends string> = string extends Path
    ? unknown
    : Path extends keyof T
    ? T[Path]
    : Path extends `${infer K}.${infer R}`
    ? K extends keyof T
        ? DotPathType<T[K], R>
        : unknown
    : unknown;
