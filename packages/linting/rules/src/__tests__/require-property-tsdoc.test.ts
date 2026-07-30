import { describe, it, expect } from 'vitest';
import { requirePropertyTsDoc } from '../require-property-tsdoc/index.js';
import type { Diagnostic, Rule } from '@equinor/fusion-framework-lint-core';

function lint(
  source: string,
  file = 'fixture.ts',
  rule: Rule = requirePropertyTsDoc(),
): Diagnostic[] {
  // mirror the engine: skip `check` entirely when `match` opts the file out
  if (rule.match && !rule.match(file)) return [];
  return rule.check(source, { filePath: file });
}

describe('require-property-tsdoc — passing', () => {
  it('passes: documented public field', () => {
    const source = `
class MyButton {
  /** The visual color variant to render. */
  color = 'primary';
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: documented decorated field', () => {
    const source = `
class MyButton {
  /** The visual color variant to render. */
  @property({ type: String })
  color = 'primary';
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: private modifier field without TSDoc', () => {
    const source = `
class MyButton {
  private internalState = 1;
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: #private field without TSDoc', () => {
    const source = `
class MyButton {
  #internalState = 1;
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: static field without TSDoc', () => {
    const source = `
class MyButton {
  static styles = [];
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: field in non-exported class when classScope is "exported"', () => {
    const rule = requirePropertyTsDoc({ classScope: 'exported' });
    const source = `
class MyButton {
  color = 'primary';
}
`;
    expect(lint(source, 'fixture.ts', rule)).toHaveLength(0);
  });
});

describe('require-property-tsdoc — failing', () => {
  it('fails: undocumented public field', () => {
    const source = `
class MyButton {
  color = 'primary';
}
`;
    const diagnostics = lint(source);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain("'color'");
  });

  it('fails: undocumented decorated field', () => {
    const source = `
class MyButton {
  @property({ type: String })
  color = 'primary';
}
`;
    const diagnostics = lint(source);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain("'color'");
  });

  it('fails: undocumented protected field', () => {
    const source = `
class MyButton {
  protected color = 'primary';
}
`;
    expect(lint(source)).toHaveLength(1);
  });

  it('fails: undocumented field in exported class when classScope is "exported"', () => {
    const rule = requirePropertyTsDoc({ classScope: 'exported' });
    const source = `
export class MyButton {
  color = 'primary';
}
`;
    expect(lint(source, 'fixture.ts', rule)).toHaveLength(1);
  });

  it('fails: non-TSDoc comment does not satisfy the rule', () => {
    const source = `
class MyButton {
  // just a regular comment
  color = 'primary';
}
`;
    expect(lint(source)).toHaveLength(1);
  });
});
