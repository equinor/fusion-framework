import { describe, expect, it } from 'vitest';

import { isEnabledEnvValue } from '../src/html/is-enabled-env-value';

describe('isEnabledEnvValue', () => {
  it.each([true, 'true'])('enables the toggle for %j', (value) => {
    expect(isEnabledEnvValue(value)).toBe(true);
  });

  it.each([false, 'false', undefined, '', 1])('keeps the toggle disabled for %j', (value) => {
    expect(isEnabledEnvValue(value)).toBe(false);
  });
});
