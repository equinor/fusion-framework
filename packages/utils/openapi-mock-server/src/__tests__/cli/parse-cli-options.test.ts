import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { parseCliOptions } from '../../cli/parse-cli-options.js';

describe('parseCliOptions', () => {
  it('keeps the first positional source when optional flags are absent', () => {
    expect(parseCliOptions(['./custom-mocks'])).toEqual({
      port: 0,
      seed: undefined,
      sources: [resolve('./custom-mocks')],
    });
  });

  it('removes numeric flags and preserves source precedence', () => {
    expect(
      parseCliOptions(['--preset=fusion', './mocks', '--port', '4010', '--seed', '42']),
    ).toEqual({
      port: 4010,
      seed: 42,
      sources: ['fusion', resolve('./mocks')],
    });
  });
});
