import { describe, expect, it } from 'vitest';

import type { DotPath, DotPathType } from '../../utils/dot-path.js';

type Config = {
  required: { nested: string };
  optional?: { nested: string; deeper?: { leaf: number } };
  scalar?: string;
};

describe('DotPath', () => {
  it('reaches into a required object property', () => {
    const path: DotPath<Config> = 'required.nested';

    expect(path).toBe('required.nested');
  });

  it('reaches into an optional object property', () => {
    // An optional property is `T | undefined`, which does not extend `object` —
    // without unwrapping it, nothing under an optional branch is reachable
    const nested: DotPath<Config> = 'optional.nested';
    const deeper: DotPath<Config> = 'optional.deeper.leaf';

    expect([nested, deeper]).toEqual(['optional.nested', 'optional.deeper.leaf']);
  });

  it('resolves the type at a path under an optional property', () => {
    const leaf: DotPathType<Config, 'optional.deeper.leaf'> = 1;
    const nested: DotPathType<Config, 'optional.nested'> = 'a';

    expect([leaf, nested]).toEqual([1, 'a']);
  });

  it('invents no paths under a scalar', () => {
    // @ts-expect-error a string carries no dot-paths of its own
    const invalid: DotPath<Config> = 'scalar.length';

    expect(invalid).toBe('scalar.length');
  });
});
