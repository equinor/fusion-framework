import { describe, expect, it } from 'vitest';
import { mergeMetadata } from '../utils/merge-telemetry-item.js';

describe('mergeMetadata', () => {
  it('returns undefined when neither side has metadata', () => {
    expect(mergeMetadata(undefined, undefined)).toBeUndefined();
  });

  it('deep-merges metadata with the target winning and arrays appended', () => {
    expect(
      mergeMetadata(
        { a: 1, nested: { b: 1 }, tags: ['x'] },
        { a: 2, nested: { c: 3 }, tags: ['y'] },
      ),
    ).toEqual({ a: 2, nested: { b: 1, c: 3 }, tags: ['x', 'y'] });
  });

  it('does not mutate the source metadata', () => {
    const source = { nested: { b: 1 } };

    mergeMetadata(source, { nested: { c: 3 } });

    expect(source).toEqual({ nested: { b: 1 } });
  });

  it('keeps class instances such as errors intact', () => {
    const error = new Error('boom');

    expect(mergeMetadata({ error: { stale: true } }, { error })?.error).toBe(error);
  });

  it('ignores __proto__ keys from untrusted metadata', () => {
    const target = JSON.parse('{"__proto__": {"polluted": true}, "safe": 1}');
    const result = mergeMetadata({}, target) as Record<string, unknown>;

    expect(result).toEqual({ safe: 1 });
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
  });
});
