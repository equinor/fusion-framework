/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * return True if T is `any`, otherwise return False
 * taken from https://github.com/joonhocho/tsdef
 *
 */
export type IsAny<T, True, False = never> =
    // test if we are going the left AND right path in the condition
    true | false extends (T extends never ? true : false) ? True : False;

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

/**
 * Helper type. Passes T out again, but boxes it in a way that it cannot
 * "widen" the type by accident if it is a generic that should be inferred
 * from elsewhere.
 *
 * ref https://github.com/Microsoft/TypeScript/issues/14829#issuecomment-322267089
 *
 */
export type NoInfer<T> = [T][T extends any ? 0 : never];

export interface TypeGuard<T> {
    (value: any): value is T;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type NotFunction<T = unknown> = T extends Function ? never : T;
