import chalk from 'chalk';

/**
 * Renders a status glyph for a step or verdict outcome.
 *
 * @param ok - Outcome value: `true` (pass), `false` (fail), or a string label
 *   such as `'blocked'` or `'flaky'` for anything in between.
 * @returns A single coloured glyph representing the outcome.
 */
export function statusIcon(ok: boolean | string): string {
  // A literal boolean outcome maps directly to pass/fail glyphs
  if (ok === true) return chalk.green('✔');
  // An explicit failure gets its own glyph, distinct from unknown/other states
  if (ok === false) return chalk.red('✖');
  return chalk.yellow('⚠'); // "blocked", "flaky", etc.
}
