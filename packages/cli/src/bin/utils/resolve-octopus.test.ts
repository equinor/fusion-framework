import { describe, expect, it } from 'vitest';

import { resolveOctopusUrl } from './resolve-octopus.js';

describe('resolveOctopusUrl', () => {
  it.each([
    [undefined, undefined],
    [false, undefined],
    [true, 'http://localhost:2000'],
    ['http://localhost:2100/', 'http://localhost:2100'],
  ])('resolves %j to %j', (option, expected) => {
    expect(resolveOctopusUrl(option)).toBe(expected);
  });
});
