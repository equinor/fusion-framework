import { describe, it, expect } from 'vitest';
import { requireTsDoc } from '../require-tsdoc/index.js';
import type { Diagnostic } from '@equinor/fusion-framework-lint-core';

function lint(source: string): Diagnostic[] {
  return requireTsDoc.check(source, 'fixture.ts');
}

// ── @template ─────────────────────────────────────────────────────────────────

describe('require-tsdoc @template', () => {
  it('passes: generic function with @template', () => {
    const source = `
/**
 * Wraps a value in an array.
 * @template T - The item type.
 * @param value - The value to wrap.
 * @returns Array containing the value.
 */
export function wrap<T>(value: T): T[] {
  return [value];
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: two type params with two @template tags', () => {
    const source = `
/**
 * Creates a typed pair.
 * @template A - First type.
 * @template B - Second type.
 * @param a - First value.
 * @param b - Second value.
 * @returns A tuple pair.
 */
export function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('fails: generic function missing @template', () => {
    const source = `
/**
 * Wraps a value.
 * @param value - The value.
 * @returns The wrapped value.
 */
export function wrap<T>(value: T): T[] {
  return [value];
}
`;
    const diags = lint(source);
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain('@template');
    expect(diags[0].message).toContain('1 type parameter');
  });

  it('fails: two type params but only one @template tag', () => {
    const source = `
/**
 * Creates a pair.
 * @template A - First type.
 * @param a - First.
 * @param b - Second.
 * @returns A tuple.
 */
export function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}
`;
    const diags = lint(source);
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain('2 type parameter(s)');
    expect(diags[0].message).toContain('documents 1');
  });
});

// ── @throws ───────────────────────────────────────────────────────────────────

describe('require-tsdoc @throws', () => {
  it('passes: function with throw and @throws', () => {
    const source = `
/**
 * Validates the config object.
 * @param config - The configuration to validate.
 * @throws {Error} When the config is missing required fields.
 */
export function validateConfig(config: Config): void {
  if (!config.name) throw new Error('name is required');
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: function without throw — @throws not required', () => {
    const source = `
/**
 * Returns the default config.
 * @returns The default configuration object.
 */
export function defaultConfig(): Config {
  return { name: 'default' };
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('fails: function with throw statement but no @throws', () => {
    const source = `
/**
 * Validates the config.
 * @param config - The config.
 */
export function validateConfig(config: Config): void {
  if (!config.name) throw new Error('name is required');
}
`;
    const diags = lint(source);
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain('@throws');
    expect(diags[0].rule).toBe('require-tsdoc');
  });

  it('fails: function with nested throw and no @throws', () => {
    const source = `
/**
 * Process entries.
 * @param items - The items.
 */
export function processItems(items: string[]): void {
  for (const item of items) {
    if (!item) throw new Error('empty item');
  }
}
`;
    const diags = lint(source);
    // throw is inside a for loop (which also requires intent comment), but
    // the tsdoc check should still flag the missing @throws on the function
    const throwsDiag = diags.find((d) => d.message.includes('@throws'));
    expect(throwsDiag).toBeDefined();
  });
});
