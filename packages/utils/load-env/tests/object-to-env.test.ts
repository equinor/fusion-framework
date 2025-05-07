import { describe, expect, it } from 'vitest';
import { objectToEnv, DEFAULT_ENV_PREFIX } from '../src';

describe('objectToEnv', () => {
  it('should convert a flat object to environment variable strings', () => {
    const input = { applicationId: 'value1', applicationName: 'value2' };
    const result = objectToEnv(input);
    expect(result).toEqual({
      [`${DEFAULT_ENV_PREFIX}_APPLICATION_ID`]: 'value1',
      [`${DEFAULT_ENV_PREFIX}_APPLICATION_NAME`]: 'value2',
    });
  });
  it('should convert a nested object to environment variable strings', () => {
    const input = {
      application: {
        id: 'value1',
        name: 'value2',
      },
    };
    const result = objectToEnv(input);
    expect(result).toEqual({
      [`${DEFAULT_ENV_PREFIX}_APPLICATION_ID`]: 'value1',
      [`${DEFAULT_ENV_PREFIX}_APPLICATION_NAME`]: 'value2',
    });
  });
  it('should handle arrays and other types correctly', () => {
    const input = {
      application: {
        id: 'value1',
        name: 'value2',
        config: {
          debug: true,
          version: 1.0,
        },
        tags: ['tag1', 'tag2'],
      },
    };
    const result = objectToEnv(input);
    expect(result).toEqual({
      [`${DEFAULT_ENV_PREFIX}_APPLICATION_ID`]: 'value1',
      [`${DEFAULT_ENV_PREFIX}_APPLICATION_NAME`]: 'value2',
      [`${DEFAULT_ENV_PREFIX}_APPLICATION_CONFIG_DEBUG`]: 'true',
      [`${DEFAULT_ENV_PREFIX}_APPLICATION_CONFIG_VERSION`]: '1',
      [`${DEFAULT_ENV_PREFIX}_APPLICATION_TAGS`]: 'tag1,tag2',
    });
  });

  it('should handle custom prefixes', () => {
    const input = { applicationId: 'value1' };
    const result = objectToEnv(input, { prefix: 'CUSTOM_' });
    expect(result).toEqual({
      CUSTOM_APPLICATION_ID: 'value1',
    });
  });
});
