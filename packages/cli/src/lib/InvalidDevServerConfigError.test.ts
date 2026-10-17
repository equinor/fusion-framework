import { describe, expect, it } from 'vitest';

import { InvalidDevServerConfigError } from './InvalidDevServerConfigError.js';

describe('InvalidDevServerConfigError.is', () => {
  it('recognizes errors with the stable invalid-config code', () => {
    const error = new InvalidDevServerConfigError(['api.serviceDiscoveryUrl: expected string']);

    expect(InvalidDevServerConfigError.is(error)).toBe(true);
  });

  it('rejects unrelated errors and non-errors with a matching code', () => {
    expect(InvalidDevServerConfigError.is(new Error('other error'))).toBe(false);
    expect(InvalidDevServerConfigError.is({ code: 'ERR_INVALID_DEV_SERVER_CONFIG' })).toBe(false);
    expect(InvalidDevServerConfigError.is(null)).toBe(false);
  });
});
