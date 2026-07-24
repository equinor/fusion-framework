import { relative } from 'node:path';
import chalk from 'chalk';
import type { Diagnostic } from '@equinor/fusion-framework-lint-core';

export { formatSummary } from './summary.js';

const ICON = { error: chalk.red('✖'), warn: chalk.yellow('⚠') } as const;
const LABEL = { error: chalk.red.bold('error'), warn: chalk.yellow.bold('warn ') } as const;

/**
 * Formats diagnostics as a coloured, human-readable terminal block for one file.
 * Each line shows location, severity icon + label, message, and rule ID.
 *
 * @param file - Absolute path of the file being reported.
 * @param diagnostics - Diagnostics to render.
 * @param verbose - When true, uses the extended `detail` message instead of the terse `message`.
 * @returns A multi-line ANSI-coloured string ready for `process.stdout.write`.
 */
export function formatPretty(file: string, diagnostics: Diagnostic[], verbose = false): string {
  const relPath = relative(process.cwd(), file);
  const lines: string[] = [`\n  ${chalk.underline.blueBright(relPath)}`];

  // Format each diagnostic as a padded, coloured line with location + message
  for (const d of diagnostics) {
    const loc = chalk.dim(`${d.line}:${d.col}`.padEnd(7));
    const icon = ICON[d.severity as keyof typeof ICON] ?? chalk.dim('·');
    const label = LABEL[d.severity as keyof typeof LABEL] ?? chalk.dim(d.severity);
    const rule = chalk.dim(`(${d.rule})`);
    const text = verbose ? (d.detail ?? d.message) : d.message;
    lines.push(`    ${loc}  ${icon} ${label}  ${text}  ${rule}`);
  }

  lines.push('');
  return lines.join('\n');
}
