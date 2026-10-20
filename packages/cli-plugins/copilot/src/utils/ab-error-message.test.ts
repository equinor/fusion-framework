import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import { abErrorMessage } from './ab-error-message.js';

describe('abErrorMessage', () => {
  it('preserves unknown execution outcomes from an actual failed JSON command', () => {
    let failure: unknown;
    try {
      execFileSync(
        process.execPath,
        [
          '-e',
          `process.stdout.write(JSON.stringify({
            success: false,
            error: 'The command may have run; inspect the result before retrying',
            code: 'outcome_unknown'
          })); process.exit(1);`,
        ],
        { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] },
      );
    } catch (error) {
      failure = error;
    }

    expect(failure).toBeInstanceOf(Error);
    expect(abErrorMessage(failure)).toBe(
      'outcome_unknown: The command may have run; inspect the result before retrying',
    );
  });

  it('preserves JSON failures without a code', () => {
    // Reproduce execFileSync's captured stdout without starting another process.
    const failure = Object.assign(new Error('Command failed'), {
      stdout: JSON.stringify({ success: false, error: 'Selector was not found' }),
    });

    expect(abErrorMessage(failure)).toBe('Selector was not found');
  });

  it.each([
    'not JSON',
    '{invalid JSON',
    'null',
    '[]',
    '{"success":true,"error":"not a failure"}',
    '{"success":false,"error":null}',
  ])('retains stderr diagnostics when stdout is not a failure envelope: %s', (stdout) => {
    // Captured stdout must not hide the original stderr diagnostic.
    const failure = Object.assign(new Error('Command failed'), {
      stdout,
      stderr: '\u001b[31m✗ Browser disconnected\u001b[0m\nother output\n⚠ Inspect state',
    });

    expect(abErrorMessage(failure)).toBe('✗ Browser disconnected | ⚠ Inspect state');
  });

  it('retains status diagnostics from the process error message', () => {
    expect(abErrorMessage(new Error('Command failed: agent-browser\n✗ Timed out'))).toBe(
      '✗ Timed out',
    );
  });

  it('bounds generic process errors', () => {
    expect(abErrorMessage(new Error('x'.repeat(300)))).toBe('x'.repeat(200));
  });

  it('reports non-Error failures', () => {
    expect(abErrorMessage('Browser unavailable')).toBe('Browser unavailable');
  });
});
