import { describe, it, expect } from 'vitest';
import { requireTsDoc, createRequireTsDoc } from '../require-tsdoc/index.js';
import type { Diagnostic } from '@equinor/fusion-framework-lint-core';

function lint(source: string): Diagnostic[] {
  return requireTsDoc.check(source, 'fixture.ts');
}

function rules(diagnostics: Diagnostic[]): string[] {
  // Extract the message text from each diagnostic for compact assertion
  const messages = diagnostics.map((d) => d.message);
  return messages;
}

// ── Passing cases ─────────────────────────────────────────────────────────────

describe('require-tsdoc — passing cases', () => {
  it('passes: function with full TSDoc, params, and @returns', () => {
    const source = `
/**
 * Fetch the user by id.
 * @param id - The user identifier.
 * @returns The user object or null.
 */
export function getUser(id: string): User | null {
  return db.find(id);
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: function with void return — no @returns required', () => {
    const source = `
/**
 * Log the current state to the console.
 * @param state - The state to log.
 */
export function logState(state: unknown): void {
  console.log(state);
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: function with no params and void return', () => {
    const source = `
/**
 * Initialise the module.
 */
export function init(): void {}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: function with Promise<void> return — no @returns required', () => {
    const source = `
/**
 * Disconnect from the service.
 */
export async function disconnect(): Promise<void> {}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: class method with TSDoc', () => {
    const source = `
/** Handles service operations. */
class Service {
  /**
   * Return the service name.
   * @returns The name string.
   */
  getName(): string {
    return this.name;
  }
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: method with no params and void return', () => {
    const source = `
/** Manages foo state. */
class Foo {
  /**
   * Reset all state.
   */
  reset(): void {}
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: object literal shorthand methods are exempt (implementing an interface)', () => {
    // initialize / get / dispose live in an object literal that satisfies a typed
    // interface — the interface carries the TSDoc, so the implementor does not need it.
    const source = `
function setup(config: IConfigurator): void {
  config.add({
    module: {
      name: 'my-module',
      initialize(args) {
        return {};
      },
      dispose() {
        // teardown
      },
    },
  });
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: object literal shorthand method inside Proxy handler is exempt', () => {
    const source = `
function wrap(target: object): object {
  return new Proxy(target, {
    get(t, prop) {
      return t[prop];
    },
  });
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes (known limitation): untyped object literal methods are also exempt', () => {
    // Ideally `const struct = { bar() {} }` would require TSDoc because no interface
    // backs it.  However, distinguishing "typed via function parameter" (the dominant
    // real-world case) from "typed via explicit annotation" requires full TypeScript
    // type resolution — which tree-sitter does not provide.  Rather than produce false
    // positives on every function argument object literal, we exempt ALL object literal
    // methods and document the limitation here.
    const source = `
const struct = {
  bar() {
    return 42;
  },
};
`;
    expect(lint(source)).toHaveLength(0);
  });
});

// ── Failing cases ─────────────────────────────────────────────────────────────

describe('require-tsdoc — failing cases', () => {
  it('fails: class method without TSDoc is still required (class methods are not exempt)', () => {
    const source = `
export class Service {
  initialize(): void {}
}
`;
    // class declaration + method → 2 diagnostics
    expect(lint(source)).toHaveLength(2);
  });

  it('fails: function with no comment at all', () => {
    const source = `
export function getUser(id: string): User | null {
  return db.find(id);
}
`;
    const diagnostics = lint(source);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toMatch(/missing a TSDoc comment/);
  });

  it('fails: function with a plain line comment (not TSDoc)', () => {
    const source = `
// get the user
export function getUser(id: string): User | null {
  return db.find(id);
}
`;
    const diagnostics = lint(source);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toMatch(/missing a TSDoc comment/);
  });

  it('fails: function with TSDoc but missing @param', () => {
    const source = `
/**
 * Fetch the user by id.
 */
export function getUser(id: string): User | null {
  return db.find(id);
}
`;
    // Two diagnostics: missing @param AND missing @returns
    const diagnostics = lint(source);
    expect(
      // Expect at least one @param diagnostic among the results
      diagnostics.some((d) => d.message.includes('@param')),
    ).toBe(true);
  });

  it('fails: function with TSDoc but missing @returns', () => {
    const source = `
/**
 * Fetch the user by id.
 * @param id - The user identifier.
 */
export function getUser(id: string): User | null {
  return db.find(id);
}
`;
    const diagnostics = lint(source);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toMatch(/@returns/);
  });

  it('fails: function with only some @param tags covered', () => {
    const source = `
/**
 * Create a record.
 * @param name - The name.
 */
export function create(name: string, value: number): Record<string, number> {
  return { [name]: value };
}
`;
    const diagnostics = lint(source);
    // Find the @param-related diagnostic to assert its message text
    const paramDiag = diagnostics.find((d) => d.message.includes('@param'));
    expect(paramDiag).toBeDefined();
    expect(paramDiag?.message).toMatch(/2 parameter\(s\) but TSDoc only documents 1/);
  });

  it('fails: class method with no TSDoc', () => {
    const source = `
export class Service {
  getName(): string {
    return this.name;
  }
}
`;
    // method + the class declaration itself → 2 diagnostics
    expect(lint(source)).toHaveLength(2);
  });

  it('fails: non-exported class — class declaration needs TSDoc (classScope all)', () => {
    const source = `
class InternalService {
  run(): void {}
}
`;
    const diags = lint(source);
    // class decl + method → 2 (classScope defaults to 'all')
    expect(
      // Expect a diagnostic mentioning InternalService by name
      diags.some((d) => d.message.includes('InternalService')),
    ).toBe(true);
  });
});

// ── classScope option ─────────────────────────────────────────────────────────

describe('require-tsdoc — classScope option', () => {
  it('classScope=exported: skips non-exported class', () => {
    const rule = createRequireTsDoc({ classScope: 'exported' });
    const source = `
class InternalHelper {
  run(): void {}
}
`;
    expect(rule.check(source, 'fixture.ts')).toHaveLength(0);
  });

  it('classScope=exported: still checks exported class', () => {
    const rule = createRequireTsDoc({ classScope: 'exported' });
    const source = `
export class PublicService {
  run(): void {}
}
`;
    // class decl + method both need TSDoc
    expect(rule.check(source, 'fixture.ts').length).toBeGreaterThan(0);
  });
});

// ── Edge cases ────────────────────────────────────────────────────────────────

describe('require-tsdoc — edge cases', () => {
  it('edge: never return type does not require @returns', () => {
    const source = `
/**
 * Throw unconditionally.
 * @param msg - The error message.
 */
export function fail(msg: string): never {
  throw new Error(msg);
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('edge: this parameter is excluded from @param count', () => {
    const source = `
/**
 * Bind the handler.
 * @param handler - The callback.
 */
export function bind(this: void, handler: () => void): void {
  handler();
}
`;
    // 'this' pseudo-param should not count → only 'handler' needs @param
    expect(lint(source)).toHaveLength(0);
  });

  it('edge: empty source produces no diagnostics', () => {
    expect(lint('')).toHaveLength(0);
  });

  it('edge: plain block comment /* */ does not satisfy TSDoc requirement', () => {
    const source = `
/* not tsdoc */
export function foo(): string { return ''; }
`;
    const diagnostics = lint(source);
    expect(
      // Expect a diagnostic complaining about missing TSDoc (not just any comment)
      diagnostics.some((d) => d.message.includes('TSDoc')),
    ).toBe(true);
  });
});
