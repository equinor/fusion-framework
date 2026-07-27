import chalk from 'chalk';

import { AUTH_ERROR_DOCS } from './auth-docs-url.js';
import { envTokenHint } from './env-token-hint.js';
import { formatAuthError } from './format-auth-error.js';

const { AUTH_DOCS_URL, APP_DOCS_URL } = AUTH_ERROR_DOCS;

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
    // Error instances carry the MSAL shape directly on the object
    if (current instanceof Error) {
      // Narrow to a plain record since MSAL's ServerError shape isn't a typed export
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
      // Extract the description text when the shape matches an MSAL error message
      if (typeof raw === 'string') {
        const descMatch = raw.match(/Description:\s*(.+?)(?:\s*Trace ID:|$)/);
        return descMatch?.[1]?.trim() ?? raw.split(' - ')[0]?.trim();
      }
      // Not a recognized MSAL shape — stop walking the cause chain
      break;
    } else {
      // Reached a non-object cause — nothing further to inspect
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
  // Non-Error values can't carry MSAL/HTTP auth metadata — bail out early
  if (!(error instanceof Error)) return undefined;

  // Check if this error or anything in its cause chain is auth-related
  const isTokenError = error.name === 'SilentTokenAcquisitionError';
  // Narrow to a plain record since HTTP client error shapes vary and don't share a common type
  const errorRecord = error as unknown as Record<string, unknown>;
  const responseStatus = errorRecord.response
    ? (errorRecord.response as Response).status
    : undefined;
  const isHttpAuthError = responseStatus === 401 || responseStatus === 403;

  // Also check cause chain for SilentTokenAcquisitionError
  let hasMsalCause = false;
  let current: unknown = error.cause;
  // Walk up to 5 levels of cause chain to avoid infinite loops
  for (let depth = 0; depth < 5 && current; depth++) {
    // Only Error instances can carry a `name` we can compare
    if (current instanceof Error) {
      // Only the MSAL token-refresh error name is treated as an auth cause
      if (current.name === 'SilentTokenAcquisitionError') {
        hasMsalCause = true;
        // Found the MSAL cause — no need to keep walking
        break;
      }
      current = current.cause;
    } else {
      // Reached a non-Error cause — nothing further to inspect
      break;
    }
  }

  // Neither a direct token error, HTTP 401/403, nor an MSAL cause — not auth-related
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
  // Append the FUSION_TOKEN hint when present so users understand which credentials are in play
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
