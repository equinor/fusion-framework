import { describe, it, expect } from 'vitest';
import { collectSuppressions } from '../collect-suppressions.js';
import { isSuppressed } from '../is-suppressed.js';

describe('collectSuppressions', () => {
  it('suppresses all rules on the next line for a bare disable-next-line comment', () => {
    const source = ['// fusion-lint-disable-next-line', 'const x = 1;'].join('\n');
    const suppressions = collectSuppressions(source);

    expect(isSuppressed(suppressions, 2, 'any-rule')).toBe(true);
    expect(isSuppressed(suppressions, 1, 'any-rule')).toBe(false);
  });

  it('suppresses only the listed rules on the next line', () => {
    const source = ['// fusion-lint-disable-next-line no-separate-export', 'export { foo };'].join(
      '\n',
    );
    const suppressions = collectSuppressions(source);

    expect(isSuppressed(suppressions, 2, 'no-separate-export')).toBe(true);
    expect(isSuppressed(suppressions, 2, 'other-rule')).toBe(false);
  });

  it('suppresses multiple comma-separated rules on the next line', () => {
    const source = [
      '// fusion-lint-disable-next-line no-separate-export, require-tsdoc',
      'export { foo };',
    ].join('\n');
    const suppressions = collectSuppressions(source);

    expect(isSuppressed(suppressions, 2, 'no-separate-export')).toBe(true);
    expect(isSuppressed(suppressions, 2, 'require-tsdoc')).toBe(true);
    expect(isSuppressed(suppressions, 2, 'other-rule')).toBe(false);
  });

  it('suppresses all rules on the same line for a bare disable-line comment', () => {
    const source = 'export { foo }; // fusion-lint-disable-line';
    const suppressions = collectSuppressions(source);

    expect(isSuppressed(suppressions, 1, 'any-rule')).toBe(true);
  });

  it('suppresses only the listed rules on the same line', () => {
    const source = 'export { foo }; // fusion-lint-disable-line no-separate-export';
    const suppressions = collectSuppressions(source);

    expect(isSuppressed(suppressions, 1, 'no-separate-export')).toBe(true);
    expect(isSuppressed(suppressions, 1, 'other-rule')).toBe(false);
  });

  it('returns an empty map when there are no suppression comments', () => {
    const suppressions = collectSuppressions('const x = 1;\nconst y = 2;');

    expect(isSuppressed(suppressions, 1, 'any-rule')).toBe(false);
    expect(isSuppressed(suppressions, 2, 'any-rule')).toBe(false);
  });
});
