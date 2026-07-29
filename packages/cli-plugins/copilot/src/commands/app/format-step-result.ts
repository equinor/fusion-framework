import chalk from 'chalk';

import type { StepResult } from './types.js';
import { statusIcon } from './status-icon.js';

/**
 * Renders a single step execution result.
 *
 * @param result - The step result to render, including its outcome, note, and evidence.
 * @returns A formatted two-line string describing the step outcome.
 */
export function formatStepResult(result: StepResult): string {
  const icon = statusIcon(result.ok);
  const files = result.evidence.length ? chalk.dim(` [${result.evidence.join(', ')}]`) : '';
  return `  ${icon}  ${result.criterion}\n${chalk.dim(`     ${result.note}`)}${files}`;
}
