import fs from 'node:fs';
import path from 'node:path';
import { describe, it, beforeEach, vi, expect, type Mocked } from 'vitest';
import { loadEnv, DEFAULT_ENV_PREFIX } from '../src';

vi.mock('node:fs');

describe('loadEnv', () => {
  const mockFs = fs as Mocked<typeof fs>;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('loads environment variables from .env files with default prefix', () => {
    const envDir = '/mock/env';
    const mode = 'development';
    const envFiles = [
      path.join(envDir, '.env'),
      path.join(envDir, '.env.local'),
      path.join(envDir, `.env.${mode}`),
      path.join(envDir, `.env.${mode}.local`),
    ];

    mockFs.statSync.mockImplementation((filePath) =>
      // biome-ignore lint/suspicious/noExplicitAny: test only
      envFiles.includes(String(filePath)) ? ({ isFile: () => true } as any) : undefined,
    );

    mockFs.readFileSync.mockImplementation((filePath) => {
      if (filePath === path.join(envDir, '.env')) {
        return [`${DEFAULT_ENV_PREFIX}_VAR=value1`, `${DEFAULT_ENV_PREFIX}_VAR_2=value2`].join(
          '\n',
        );
      }
      if (filePath === path.join(envDir, `.env.${mode}`)) {
        return `${DEFAULT_ENV_PREFIX}_VAR_3=value3`;
      }
      return '';
    });

    const result = loadEnv({ mode, envDir });

    expect(result).toEqual({
      [`${DEFAULT_ENV_PREFIX}_VAR`]: 'value1',
      [`${DEFAULT_ENV_PREFIX}_VAR_2`]: 'value2',
      [`${DEFAULT_ENV_PREFIX}_VAR_3`]: 'value3',
    });
  });

  it('filters environment variables by custom prefixes', () => {
    const prefixes = ['CUSTOM_', 'ANOTHER_'];

    // biome-ignore lint/suspicious/noExplicitAny: test only
    mockFs.statSync.mockReturnValue({ isFile: () => true } as any);
    mockFs.readFileSync.mockReturnValue(
      ['CUSTOM_VAR=value1', 'ANOTHER_VAR=value2', 'DEFAULT_VAR=value3'].join('\n'),
    );

    const result = loadEnv({ prefixes });

    expect(result).toEqual({
      CUSTOM_VAR: 'value1',
      ANOTHER_VAR: 'value2',
    });
  });

  it('prioritizes process.env variables over .env file variables', () => {
    process.env[`${DEFAULT_ENV_PREFIX}_CUSTOM_VAR`] = 'processValue';

    // biome-ignore lint/suspicious/noExplicitAny: test only
    mockFs.statSync.mockReturnValue({ isFile: () => true } as any);
    mockFs.readFileSync.mockReturnValue(
      [
        `${DEFAULT_ENV_PREFIX}_CUSTOM_VAR=fileValue`,
        `${DEFAULT_ENV_PREFIX}_ANOTHER_VAR=anotherValue`,
      ].join('\n'),
    );

    const result = loadEnv({ prefixes: [`${DEFAULT_ENV_PREFIX}_CUSTOM_`] });

    expect(result).toEqual({
      [`${DEFAULT_ENV_PREFIX}_CUSTOM_VAR`]: 'processValue',
    });

    delete process.env[`${DEFAULT_ENV_PREFIX}_CUSTOM_VAR`];
  });

  it('throws an error if mode is "local"', () => {
    expect(() => loadEnv({ mode: 'local' })).toThrow(
      `"local" cannot be used as a mode name because it conflicts with the .local postfix for .env files.`,
    );
  });
});
