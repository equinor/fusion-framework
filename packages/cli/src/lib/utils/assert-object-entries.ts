import { assert } from './assert.js';

/**
 * Asserts that a specific property exists and has a value on an object.
 * Used internally for property value checks.
 *
 * @param value - The value of the property to check.
 * @param prop - The property key being checked.
 * @param message - Optional custom error message.
 * @throws {AssertionError} If the property value is falsy.
 */
function assertObjectEntryValue<P>(value: unknown, prop: P, message?: string): asserts value {
  // Checks for truthy value; falsy values (0, '', false) will fail.
  assert(!!value, message ?? `missing value of property ${prop}`);
}

/**
 * Asserts that an object contains the specified properties and that each property has a value.
 * Allows for custom assertion logic and pre-message prefixing.
 *
 * @template T - The object type to check.
 * @template P - The array of property keys to check on the object.
 * @param value - The object to check.
 * @param options - Optional settings for property keys, assertion function, and message prefix.
 * @returns Nothing; narrows `value` via the `asserts` return type. Throws on failure.
 * @throws {AssertionError} If any property is missing or fails the assertion.
 */
export function assertObjectEntries<T extends object, P extends Array<keyof T>>(
  value: T,
  options?: {
    props?: P;
    assertion?: typeof assertObjectEntryValue;
    preMessage?: string;
  },
): asserts value {
  // Use preMessage to prefix all assertion messages for context.
  const preMessage = options?.preMessage ?? '';
  // Ensure the value is an object before checking properties.
  assert(typeof value === 'object', `${preMessage} to be an <object>`);
  // Use custom assertion if provided, otherwise default.
  const assertion: typeof assertObjectEntryValue<P> = options?.assertion ?? assertObjectEntryValue;
  // Use provided property list or all keys of the object.
  const props = options?.props ?? Object.keys(value);
  // Validate each property individually so all failures reference the specific key
  for (const prop of props) {
    // Check that the property exists on the object.
    assert(prop in value, `${preMessage} to have property [${String(prop)}]`);
    // Check that the property value passes the assertion.
    assertion(
      value[prop as keyof T],
      prop as unknown as P,
      `${preMessage} property [${String(prop)}] to have value`,
    );
  }
}
