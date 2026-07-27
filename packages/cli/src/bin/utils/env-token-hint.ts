import chalk from 'chalk';

/**
 * Builds a hint line when the `FUSION_TOKEN` env var is set, warning that
 * the CLI is using it instead of an interactive login session.
 *
 * @returns A styled hint string, or `undefined` if `FUSION_TOKEN` is not set.
 */
export function envTokenHint(): string | undefined {
  // Surface that the CLI picked up an explicit token so the user understands
  // why their interactive `ffc auth login` session is not being used.
  if (process.env.FUSION_TOKEN) {
    return [
      chalk.bold('💡 FUSION_TOKEN detected'),
      chalk.dim('   The CLI is using this token instead of your interactive login session.'),
      chalk.dim(
        '   If this is unintended, unset the variable and retry, or verify that the token has the correct scope/audience.',
      ),
    ].join('\n');
  }
  return undefined;
}
