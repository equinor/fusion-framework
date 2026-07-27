import chalk from 'chalk';

import type { Plan } from './types.js';
import { truncate } from './truncate.js';

/**
 * Renders a structured plan as a human-readable summary.
 *
 * @param plan - The plan to render, containing a summary and ordered steps.
 * @returns A multi-line string suitable for console output.
 */
export function formatPlan(plan: Plan): string {
  const lines = [
    '',
    chalk.bold(`📋 ${plan.summary}`),
    '',
    ...plan.steps.flatMap((s, si) => [
      `  ${chalk.dim(`${si + 1}.`)} ${s.scenario}`,
      ...s.criteria
        // Truncate each criterion so long descriptions don't wrap the terminal
        .map((c) => chalk.dim(`     • ${truncate(c, 70)}`)),
    ]),
    '',
  ];
  return lines.join('\n');
}
