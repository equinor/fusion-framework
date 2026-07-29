/**
 * Re-exports the core Node.js assert function and AssertionError class.
 *
 * This provides consistent assertion handling throughout the codebase
 * with proper TypeScript type narrowing support.
 */
export { default as assert, AssertionError } from 'node:assert';
