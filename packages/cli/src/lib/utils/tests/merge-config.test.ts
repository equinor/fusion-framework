import { describe, expect, it } from 'vitest';
import { mergeConfig } from '../merge-config.js';

describe('mergeConfig', () => {
  it('merges nested objects with overrides winning and appends arrays by default', () => {
    expect(
      mergeConfig(
        { server: { port: 3000, host: 'a' }, scopes: ['x'] },
        { server: { host: 'b' }, scopes: ['y'], extra: true },
      ),
    ).toEqual({ server: { port: 3000, host: 'b' }, scopes: ['x', 'y'], extra: true });
  });

  it('does not mutate the base config', () => {
    const base = { server: { port: 3000 }, scopes: ['x'] };

    mergeConfig(base, { server: { host: 'b' }, scopes: ['y'] });

    expect(base).toEqual({ server: { port: 3000 }, scopes: ['x'] });
  });

  it('lets explicit undefined, arrays, and class instances replace the base value', () => {
    const url = new URL('https://example.com');
    expect(
      mergeConfig({ a: 1, b: { c: 1 }, url: { href: 'x' } }, { a: undefined, b: [1], url }),
    ).toEqual({
      a: undefined,
      b: [1],
      url,
    });
  });

  it('passes the property key to a custom array strategy', () => {
    const result = mergeConfig(
      { scopes: ['a'], nested: { scopes: ['b'], list: [1] } },
      { scopes: ['x'], nested: { scopes: ['y'], list: [2] } },
      (base, overrides, key) => (key === 'scopes' ? overrides : base.concat(overrides)),
    );
    expect(result).toEqual({ scopes: ['x'], nested: { scopes: ['y'], list: [1, 2] } });
  });

  it('ignores __proto__ keys from untrusted overrides', () => {
    const overrides = JSON.parse(
      '{"__proto__": {"polluted": true}, "nested": {"__proto__": {"polluted": true}}}',
    );
    const result = mergeConfig<Record<string, unknown>>({ nested: {} }, overrides);

    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.getPrototypeOf(result.nested)).toBe(Object.prototype);
    expect(result.polluted).toBeUndefined();
  });

  it('strips __proto__ keys from override values that have no base counterpart, at any depth', () => {
    const overrides = JSON.parse(
      '{"added": {"deep": {"__proto__": {"polluted": true}}}, "list": [{"__proto__": {"polluted": true}}], "replaced": {"__proto__": {"polluted": true}}}',
    );
    type Merged = { added: { deep: object }; list: object[]; replaced: object };
    const base: Record<string, unknown> = { list: [], replaced: 'primitive' };
    const result = mergeConfig(base, overrides) as Merged;
    // Object.assign uses [[Set]], so a surviving own `__proto__` key would swap the prototype
    const reassigned = [
      Object.assign({}, result.added.deep),
      Object.assign({}, result.list[0]),
      Object.assign({}, result.replaced),
    ];

    // Each value came from the overrides without a base counterpart to merge with
    for (const value of reassigned) {
      expect(Object.getPrototypeOf(value)).toBe(Object.prototype);
      expect(Object.hasOwn(value, '__proto__')).toBe(false);
    }
  });
});
