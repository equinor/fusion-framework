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

  it('prefers JSON failures over stderr diagnostics and ignores non-string codes', () => {
    // Competing diagnostics verify that the command protocol wins.
    const failure = Object.assign(new Error('Command failed'), {
      stdout: JSON.stringify({ success: false, error: 'Selector was not found', code: 42 }),
      stderr: '✗ Generic failure',
    });

    expect(abErrorMessage(failure)).toBe('Selector was not found');
  });

  it.each([undefined, null, 42, Buffer.from('✗ Browser disconnected')])(
    'falls back to the process message for non-string captured streams: %s',
    (stream) => {
      // Invalid stream values must not hide the usable process message.
      const failure = Object.assign(new Error('Command failed\n✗ Timed out'), {
        stdout: stream,
        stderr: stream,
      });

      expect(abErrorMessage(failure)).toBe('✗ Timed out');
    },
  );

  it('normalizes line breaks in JSON error messages and codes', () => {
    // JSON escaping allows multiline diagnostics even when stdout occupies one line.
    const failure = Object.assign(new Error('Command failed'), {
      stdout: JSON.stringify({
        success: false,
        error: 'Inspect the page\r\n  before retrying',
        code: 'outcome_unknown',
      }),
    });

    expect(abErrorMessage(failure)).toBe('outcome_unknown: Inspect the page | before retrying');
  });

  it.each([
    ['First line\r\nSecond line', 'First line | Second line'],
    [new Error('First line\nSecond line'), 'First line | Second line'],
  ])('normalizes line breaks in fallback messages: %s', (failure, expected) => {
    expect(abErrorMessage(failure)).toBe(expected);
  });

  it('uses the process message when stderr contains no status diagnostics', () => {
    // Incidental logging is not a replacement for the process failure.
    const failure = Object.assign(new Error('Browser unavailable'), {
      stderr: 'Debug output only',
    });

    expect(abErrorMessage(failure)).toBe('Browser unavailable');
  });
});
