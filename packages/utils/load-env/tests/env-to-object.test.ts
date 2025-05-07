import { describe, expect, it } from 'vitest';
import { DEFAULT_ENV_PREFIX, envToObject } from '../src';

describe('envToObject', () => {
  it('should handle a single key', () => {
    const input = {
      [`${DEFAULT_ENV_PREFIX}_APP`]: '"testApp"',
    };
    const result = envToObject(input);
    expect(result).toEqual({
      app: 'testApp',
    });
  });

  it('should handle custom prefixes', () => {
    const input = {
      CUSTOM_PREFIX_APP: '"testApp"',
      CUSTOM_PREFIX_VERSION: '"1.0.0"',
    };
    const result = envToObject(input, { prefix: 'CUSTOM_PREFIX' });
    expect(result).toEqual({
      app: 'testApp',
      version: '1.0.0',
    });
  });

  it('should convert flat env variables to a nested object', () => {
    const input = {
      [`${DEFAULT_ENV_PREFIX}_APP_NAME`]: '"testApp"',
      [`${DEFAULT_ENV_PREFIX}_APP_VERSION`]: '"1.0.0"',
      [`${DEFAULT_ENV_PREFIX}_APP_CONFIG_DEBUG`]: 'true',
    };
    const result = envToObject(input);
    expect(result).toEqual({
      app: {
        name: 'testApp',
        version: '1.0.0',
        config: {
          debug: true,
        },
      },
    });
  });

  it('should skip keys that do not start with the prefix', () => {
    const input = {
      [`${DEFAULT_ENV_PREFIX}_APP_NAME`]: '"testApp"',
      OTHER_KEY: '"shouldBeSkipped"',
    };
    const result = envToObject(input);
    expect(result).toEqual({
      app: {
        name: 'testApp',
      },
    });
  });

  it('should camelcase values correctly', () => {
    const input = {
      [`${DEFAULT_ENV_PREFIX}_APP`]: '"testApp"',
      [`${DEFAULT_ENV_PREFIX}_APP_VERSION`]: '"1.0.0"',
    };
    const result = envToObject(input, { camelcase: ['APP_VERSION'] });
    expect(result).toEqual({
      app: 'testApp',
      appVersion: '1.0.0',
    });
  });
});
