import assert from 'node:assert';
export const expect = <T>(value: T) => {
    return {
        toBe: (expected: T, message: string): asserts expected => {
            assert(
                value === expected,
                Error(message, {
                    cause: {
                        expected,
                        actual: value,
                        value,
                    },
                }),
            );
            return this;
        },
        toBeInstanceOf: (expected: typeof value, message: string): asserts expected => {
            const actual = typeof value;
            assert(
                actual === expected,
                Error(message, {
                    cause: {
                        expected,
                        actual,
                        value: value === undefined ? 'undefined' : value,
                    },
                }),
            );
            return this;
        },
    };
};
