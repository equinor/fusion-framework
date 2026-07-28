import chalk from 'chalk';

/**
 * Formats the final scan summary line.
 * Green tick when clean; red/yellow counts with totals when issues are found.
 *
 * @param files    - Total number of files scanned.
 * @param errors   - Number of error-severity diagnostics.
 * @param warnings - Number of warn-severity diagnostics.
 * @returns A single formatted summary string ready to print.
 */
export function formatSummary(files: number, errors: number, warnings: number): string {
  const fileLabel = `${files} file${files === 1 ? '' : 's'}`;

  // Clean run: no problems at all
  if (errors === 0 && warnings === 0) {
    return `${chalk.green('✔')} ${chalk.green.bold('No problems found')} ${chalk.dim(`in ${fileLabel}`)}`;
  }

  const parts: string[] = [];
  // Add error count to the summary if any errors exist
  if (errors > 0) parts.push(chalk.red.bold(`${errors} error${errors === 1 ? '' : 's'}`));
  // Add warning count to the summary if any warnings exist
  if (warnings > 0)
    parts.push(chalk.yellow.bold(`${warnings} warning${warnings === 1 ? '' : 's'}`));

  const total = errors + warnings;
  const totalLabel = `${total} problem${total === 1 ? '' : 's'}`;
  const icon = errors > 0 ? chalk.red('✖') : chalk.yellow('⚠');

  return `${icon} ${chalk.bold(totalLabel)} (${parts.join(', ')}) ${chalk.dim(`in ${fileLabel}`)}`;
}
