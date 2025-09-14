import assert, { AssertionError } from 'node:assert';
import { fileExists } from './file-exists.js';
import { isGitDir } from './is-git-dir.js';

/**
 * Re-exports the core Node.js assert function and AssertionError class.
 * 
 * This provides consistent assertion handling throughout the codebase
 * with proper TypeScript type narrowing support.
 */
export { assert, AssertionError };

/**
 * Asserts that the provided value is a valid number (not NaN).
 * 
 * This function checks that the value is not NaN, which is useful for
 * validating numeric inputs that might be strings or other types that
 * could convert to NaN.
 * 
 * @param value - The value to check for being a valid number
 * @param message - Optional custom error message for assertion failure
 * @throws {AssertionError} If value is NaN
 * 
 * @example
 * ```typescript
 * assertNumber(42); // ✅ Passes
 * assertNumber('42'); // ✅ Passes (string converts to number)
 * assertNumber(NaN); // ❌ Throws AssertionError
 * assertNumber('invalid'); // ❌ Throws AssertionError
 * ```
 */
export function assertNumber(value: unknown, message?: string): asserts value {
  // Ensure the value is not NaN; this does not check for type 'number'.
  assert(
    !Number.isNaN(value),
    new AssertionError({
      message,
      actual: value,
      expected: '<number>',
    }),
  );
}

/**
 * Asserts that a file exists at the given path.
 * 
 * This function uses the fileExists utility to check for file presence
 * and throws an AssertionError if the file is not found.
 * 
 * @param value - The file path to check
 * @param message - Optional custom error message for assertion failure
 * @throws {AssertionError} If the file does not exist
 * 
 * @example
 * ```typescript
 * assertFileExists('/path/to/file.txt'); // ✅ Passes if file exists
 * assertFileExists('/nonexistent/file.txt'); // ❌ Throws AssertionError
 * ```
 */
export const assertFileExists = (value: unknown, message?: string): asserts value => {
  // Use fileExists utility to check for file presence
  assert(fileExists(value as string), message ?? `file ${String(value)} does not exist`);
};

/**
 * Asserts that the provided value is an object.
 * 
 * This function checks that the value has type 'object'. Note that
 * typeof null is 'object' in JavaScript, so null values will pass this check.
 * 
 * @param value - The value to check for being an object
 * @param message - Optional custom error message or Error instance
 * @throws {AssertionError} If value is not an object
 * 
 * @example
 * ```typescript
 * assertObject({}); // ✅ Passes
 * assertObject([]); // ✅ Passes
 * assertObject(null); // ✅ Passes (typeof null === 'object')
 * assertObject('string'); // ❌ Throws AssertionError
 * ```
 */
export function assertObject(value: object, message?: string | Error): asserts value {
  // typeof null is 'object', so this does not exclude null values
  assert(typeof value === 'object', message);
}

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
 * @typeParam T - The object type to check.
 * @typeParam P - The array of property keys to check on the object.
 * @param value - The object to check.
 * @param options - Optional settings for property keys, assertion function, and message prefix.
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



/**
 * Asserts that a directory exists and is a valid git repository.
 * 
 * This function checks if the specified directory contains a valid
 * git repository by looking for the .git directory or file.
 * 
 * @param dir - Directory path to check for git repository
 * @param message - Optional custom error message for assertion failure
 * @throws {AssertionError} If the directory is not a git repository
 * 
 * @example
 * ```typescript
 * assertGitRepository('/path/to/git/repo'); // ✅ Passes if .git exists
 * assertGitRepository('/path/to/regular/dir'); // ❌ Throws AssertionError
 * ```
 */
export function assertGitRepository(dir: string, message?: string): void {
  assert(
    isGitDir(dir),
    new AssertionError({
      message: message ?? `Directory is not a git repository: ${dir}`,
      actual: dir,
      expected: '<git repository>',
    }),
  );
}
