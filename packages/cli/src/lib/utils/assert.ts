import assert, { AssertionError } from 'node:assert';

export { assert, AssertionError };

export function assertNumber(value: unknown, message?: string): asserts value {
    assert(
        !Number.isNaN(value),
        new AssertionError({
            message,
            actual: value,
            expected: '<number>',
        }),
    );
}

export function assertObject(value: object, message?: string | Error): asserts value {
    assert(typeof value === 'object', message);
}

function assertObjectEntryValue<P>(value: unknown, prop: P, message?: string): asserts value {
    assert(!!value, message ?? `missing value of property ${prop}`);
}

export function assertObjectEntries<T extends object, P extends Array<keyof T>>( // extends Record<string, unknown> = unknown>(
    value: T,
    options?: {
        props?: P;
        assertion?: typeof assertObjectEntryValue;
        preMessage?: string;
    },
): asserts value {
    const preMessage = options?.preMessage ?? '';
    assert(typeof value === 'object', `${preMessage} to be an <object>`);
    const assertion: typeof assertObjectEntryValue<P> =
        options?.assertion ?? assertObjectEntryValue;
    const props = options?.props ?? Object.keys(value);
    for (const prop of props) {
        assert(prop in value, `${preMessage} to have property [${String(prop)}]`);
        assertion(
            value[prop as keyof T],
            prop as unknown as P,
            `${preMessage} property [${String(prop)}] to have value`,
        );
    }
}
