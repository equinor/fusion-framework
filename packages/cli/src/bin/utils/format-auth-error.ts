/**
 * Shared formatting for authentication and authorization errors in CLI commands.
 *
 * Maps HTTP 401/403 status codes to actionable, user-facing error messages with
 * guidance on how to resolve common auth failures during publish workflows.
 *
 * @packageDocumentation
 */
import chalk from 'chalk';

import { AUTH_ERROR_DOCS } from './auth-error-docs.js';
import { envTokenHint } from './env-token-hint.js';

const { AUTH_DOCS_URL, APP_DOCS_URL } = AUTH_ERROR_DOCS;

/**
 * Builds a multi-line, actionable error message for 401 (authentication) failures.
 *
 * @param context - A short description of the operation that failed (e.g. "upload bundle for my-app").
 * @returns A formatted error string with troubleshooting steps.
 */
function formatAuthenticationError(context: string): string {
  const lines = [
    '',
    chalk.redBright(`🚫 Authentication failed: unable to ${context}`),
    '',
    '   No valid token was provided or the token has expired.',
    '',
  ];

  const tokenHint = envTokenHint();
  // Append the FUSION_TOKEN hint when present so users understand which credentials are in play
  if (tokenHint) {
    lines.push(tokenHint, '');
  }

  lines.push(
    chalk.whiteBright('  Troubleshooting:'),
    '',
    `    ${chalk.cyan('1.')} For CI/CD, verify that ${chalk.bold('FUSION_TOKEN')} is set and the token has not expired.`,
    `    ${chalk.cyan('2.')} For local development, run ${chalk.greenBright.bold('ffc auth login')} to refresh your credentials.`,
    `    ${chalk.cyan('3.')} Verify that ${chalk.bold('--scope')} targets the correct API audience for your environment.`,
    '',
    `  ${chalk.dim('Auth docs:')}    ${chalk.blueBright.underline(AUTH_DOCS_URL)}`,
    `  ${chalk.dim('Publish docs:')} ${chalk.blueBright.underline(APP_DOCS_URL)}`,
    '',
  );

  return lines.join('\n');
}

/**
 * Builds a multi-line, actionable error message for 403 (authorization) failures.
 *
 * @param context - A short description of the operation that failed (e.g. "tag my-app").
 * @returns A formatted error string with troubleshooting steps.
 */
function formatAuthorizationError(context: string): string {
  const lines = [
    '',
    chalk.redBright(`🚫 Authorization failed: not permitted to ${context}`),
    '',
    '⚠️ Your token is valid but does not have the required permissions for this operation.',
    '',
  ];

  const tokenHint = envTokenHint();
  // Append the FUSION_TOKEN hint when present so users understand which credentials are in play
  if (tokenHint) {
    lines.push(tokenHint, '');
  }

  lines.push(
    chalk.whiteBright('   Troubleshooting:'),
    '',
    `     ${chalk.cyan('1.')} Verify that your user or service principal has publish permissions for this application.`,
    `     ${chalk.cyan('2.')} Check that the token's ${chalk.bold('scope / audience')} matches the target environment.`,
    `     ${chalk.cyan('3.')} Confirm that the application is registered and your account has the correct role assignment.`,
    '',
    `   ${chalk.dim('Auth docs:')}    ${chalk.blueBright.underline(AUTH_DOCS_URL)}`,
    `   ${chalk.dim('Publish docs:')} ${chalk.blueBright.underline(APP_DOCS_URL)}`,
    '',
  );

  return lines.join('\n');
}

/**
 * Formats an HTTP 401 or 403 response into a clear, actionable CLI error message.
 *
 * Returns `undefined` for status codes that are not auth-related so callers
 * can fall through to their existing error handling.
 *
 * @param status - The HTTP response status code.
 * @param context - A short, human-readable description of the failed operation
 *   (e.g. `"upload bundle for my-app"`, `"tag my-app@1.0.0"`).
 * @returns A formatted error string, or `undefined` if the status is not 401/403.
 *
 * @example
 * ```ts
 * const msg = formatAuthError(401, 'upload bundle for my-app');
 * if (msg) {
 *   log.error(msg);
 * }
 * ```
 */
export function formatAuthError(status: number, context: string): string | undefined {
  // Only 401/403 map to a dedicated message; other statuses fall through to caller handling
  switch (status) {
    case 401:
      return formatAuthenticationError(context);
    case 403:
      return formatAuthorizationError(context);
    default:
      return undefined;
  }
}

