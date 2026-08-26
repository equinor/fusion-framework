import { describe, expect, it } from 'vitest';

import { isModuleNotFoundError } from './is-module-not-found-error.js';

const createModuleError = (code: string, message: string): NodeJS.ErrnoException => {
  const error: NodeJS.ErrnoException = new Error(message);
  error.code = code;
  return error;
};

describe('isModuleNotFoundError', () => {
  it.each(['ERR_MODULE_NOT_FOUND', 'MODULE_NOT_FOUND'])(
    'recognizes %s for the requested package',
    (code) => {
      const error = createModuleError(code, "Cannot find package '@equinor/example-plugin'");

      expect(isModuleNotFoundError(error, '@equinor/example-plugin')).toBe(true);
    },
  );

  it('rejects a missing transitive dependency', () => {
    const error = createModuleError(
      'ERR_MODULE_NOT_FOUND',
      "Cannot find package 'missing-transitive-dependency'",
    );

    expect(isModuleNotFoundError(error, '@equinor/example-plugin')).toBe(false);
  });

  it('rejects unrelated errors', () => {
    expect(isModuleNotFoundError(new Error('plugin initialization failed'))).toBe(false);
  });
});
