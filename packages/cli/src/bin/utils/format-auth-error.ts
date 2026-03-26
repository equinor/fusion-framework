/**
 * Shared formatting for authentication and authorization errors in CLI commands.
 *
 * Maps HTTP 401/403 status codes to actionable, user-facing error messages with
 * guidance on how to resolve common auth failures during publish workflows.
 *
 * @packageDocumentation
 */
import chalk from 'chalk';

/** Docs URL for CLI authentication reference. */
const AUTH_DOCS_URL =
  'https://github.com/equinor/fusion-framework/blob/main/packages/cli/docs/auth.md';

/** Docs URL for CLI application publishing reference. */
const APP_DOCS_URL =
  'https://github.com/equinor/fusion-framework/blob/main/packages/cli/docs/application.md';

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
 * Builds a hint line when the `FUSION_TOKEN` env var is set, warning that
 * the CLI is using it instead of an interactive login session.
 *
 * @returns A styled hint string, or `undefined` if `FUSION_TOKEN` is not set.
 */
function envTokenHint(): string | undefined {
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
  switch (status) {
    case 401:
      return formatAuthenticationError(context);
    case 403:
      return formatAuthorizationError(context);
    default:
      return undefined;
  }
}

/**
 * Walks an error's cause chain looking for an MSAL `ServerError` and extracts
 * a human-readable description from it.
 *
 * The MSAL cause typically has `errorCode` (e.g. `"invalid_grant"`) and an
 * `errorMessage` with the full Azure AD description. We pull the short
 * description text out so the CLI can show it without the raw stack trace.
 */
function extractMsalDetail(error: unknown): string | undefined {
  let current: unknown = error;
  // Walk up to 5 levels of cause chain to avoid infinite loops
  for (let depth = 0; depth < 5 && current; depth++) {
    if (current instanceof Error) {
      const rec = current as unknown as Record<string, unknown>;
      // Check for MSAL ServerError shape (has errorCode + errorMessage)
      if (typeof rec.errorMessage === 'string') {
        const raw = rec.errorMessage;
        const descMatch = raw.match(/Description:\s*(.+?)(?:\s*Trace ID:|$)/);
        return descMatch?.[1]?.trim() ?? raw.split(' - ')[0]?.trim();
      }
      current = current.cause;
    } else if (typeof current === 'object' && 'errorMessage' in current) {
      // MSAL ServerError-like object that may not extend Error
      const raw = (current as Record<string, unknown>).errorMessage;
      if (typeof raw === 'string') {
        const descMatch = raw.match(/Description:\s*(.+?)(?:\s*Trace ID:|$)/);
        return descMatch?.[1]?.trim() ?? raw.split(' - ')[0]?.trim();
      }
      break;
    } else {
      break;
    }
  }
  return undefined;
}

/**
 * Detects whether an error is (or wraps) an authentication/authorization failure.
 *
 * Checks for:
 * - `SilentTokenAcquisitionError` (MSAL token refresh failure)
 * - HTTP response errors with 401/403 status (including `HttpJsonResponseError`
 *   from the JSON selector when a service returns an auth error page)
 * - Errors whose cause chain contains one of the above
 *
 * Returns `undefined` when the error is not auth-related, so callers can
 * fall through to generic error handling.
 *
 * @param error - The caught error value.
 * @param context - A short description of the failed operation (e.g. `"check registration for my-app"`).
 * @returns A formatted error string, or `undefined` if the error is not an auth failure.
 */
export function formatTokenAcquisitionError(error: unknown, context: string): string | undefined {
  if (!(error instanceof Error)) return undefined;

  // Check if this error or anything in its cause chain is auth-related
  const isTokenError = error.name === 'SilentTokenAcquisitionError';
  const responseStatus = (error as unknown as Record<string, unknown>).response
    ? ((error as unknown as Record<string, unknown>).response as Response).status
    : undefined;
  const isHttpAuthError = responseStatus === 401 || responseStatus === 403;

  // Also check cause chain for SilentTokenAcquisitionError
  let hasMsalCause = false;
  let current: unknown = error.cause;
  for (let depth = 0; depth < 5 && current; depth++) {
    if (current instanceof Error) {
      if (current.name === 'SilentTokenAcquisitionError') {
        hasMsalCause = true;
        break;
      }
      current = current.cause;
    } else {
      break;
    }
  }

  if (!isTokenError && !isHttpAuthError && !hasMsalCause) {
    return undefined;
  }

  // For HTTP 401/403, delegate to the status-specific formatter if no MSAL detail
  if (isHttpAuthError && !isTokenError && !hasMsalCause) {
    return formatAuthError(responseStatus, context);
  }

  // MSAL token acquisition path — extract the Azure AD detail if available
  const msalDetail = extractMsalDetail(error);
  const lines = [
    '',
    chalk.redBright(`🔑 Token acquisition failed: unable to ${context}`),
    '',
    chalk.yellow(
      `⚠️ ${msalDetail ?? 'The CLI could not silently acquire an access token for this operation.'}`,
    ),
    '',
  ];

  const tokenHint = envTokenHint();
  if (tokenHint) {
    lines.push(tokenHint, '');
  }

  lines.push(
    chalk.whiteBright('  Troubleshooting:'),
    '',
    `     ${chalk.cyan('1.')} Run ${chalk.greenBright.bold('ffc auth login')} to refresh your local credentials.`,
    `     ${chalk.cyan('2.')} For CI/CD, set a fresh ${chalk.bold('FUSION_TOKEN')} — cached refresh tokens may have expired.`,
    `     ${chalk.cyan('3.')} Verify that ${chalk.bold('--scope')} targets the correct API audience for your environment.`,
    '',
    `   ${chalk.dim('Auth docs:')}    ${chalk.blueBright.underline(AUTH_DOCS_URL)}`,
    `   ${chalk.dim('Publish docs:')} ${chalk.blueBright.underline(APP_DOCS_URL)}`,
    '',
  );

  return lines.join('\n');
}
