import chalk from 'chalk';

import type { Verdict } from './types.js';
import { statusIcon } from './status-icon.js';

/**
 * Renders the final verdict as a full-width coloured report.
 *
 * @param verdict - The verdict to render, including per-step results, reasoning, and UX feedback.
 * @returns A multi-line string suitable for console output.
 */
export function formatVerdict(verdict: Verdict): string {
  const bar = '═'.repeat(60);
  const banner = verdict.pass
    ? chalk.bgGreen.black.bold(' ✅ PASS ')
    : chalk.bgRed.white.bold(' ❌ FAIL ');

  const lines = [
    '',
    bar,
    `  ${banner}`,
    bar,
    '',
    ...verdict.steps
      // Render each step's outcome as a status glyph, criterion, and note
      .map((s) => `  ${statusIcon(s.ok)}  ${s.criterion}\n${chalk.dim(`     ${s.note}`)}`),
    '',
    chalk.dim(`  ${verdict.reasoning}`),
    '',
  ];

  // Append optional UX feedback only when the judge actually provided any
  if (verdict.ux && verdict.ux.length > 0) {
    lines.push(chalk.bold('  💡 UX Feedback'), '');
    // List every UX hint as its own bullet line
    for (const hint of verdict.ux) {
      lines.push(chalk.yellow(`  • ${hint}`));
    }
    lines.push('');
  }

  return lines.join('\n');
}
