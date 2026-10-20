/**
 * Extracts the user-facing error message from an agent-browser failure.
 *
 * Prefers JSON failure messages and codes, including `outcome_unknown`, so callers
 * can inspect state before retrying. Otherwise uses ANSI-free stderr diagnostics
 * prefixed with `✗` or `⚠`, then a diagnostic in the process error message, then
 * its first 200 characters. Joins embedded line breaks with ` | `.
 *
 * @param err - The caught error (typically from {@link ab})
 * @returns A single-line summary suitable for console output
 */
export function abErrorMessage(err: unknown): string {
  let message = String(err);

  // Process failures carry diagnostics that take precedence over the generic message.
  if (err instanceof Error) {
    const stdout = 'stdout' in err ? err.stdout : undefined;
    const stderr = 'stderr' in err && typeof err.stderr === 'string' ? err.stderr : '';
    // biome-ignore lint/suspicious/noControlCharactersInRegex: stripping ANSI escape sequences
    const ansiPattern = /\x1B\[[0-9;]*m/g;
    const diagnostics = stderr
      .replace(ansiPattern, '')
      .split(/\r?\n/)
      // Status markers may be indented in captured output.
      .map((line) => line.trim())
      // Debug output must not obscure actionable browser diagnostics.
      .filter((line) => line.startsWith('✗') || line.startsWith('⚠'))
      .join(' | ');
    const fallback = err.message.match(/[✗⚠].+/)?.[0] ?? err.message.slice(0, 200);

    message = jsonFailureMessage(stdout) ?? (diagnostics || fallback);
  }

  return message.replace(/\s*[\r\n]+\s*/g, ' | ');
}

/**
 * Reads only agent-browser failure envelopes; other stdout leaves stderr in control.
 *
 * @param stdout - Captured process output, which may not be JSON or a string.
 * @returns The failure message with its optional code, or undefined for other output.
 */
function jsonFailureMessage(stdout: unknown): string | undefined {
  // Only text output can contain the JSON command protocol.
  if (typeof stdout !== 'string' || !stdout.trim()) return undefined;

  let response: unknown;
  try {
    response = JSON.parse(stdout);
  } catch (error) {
    // Malformed command output is recoverable; unexpected parser failures are not.
    if (!(error instanceof SyntaxError)) throw error;
    // Plain-text stdout is expected for commands that do not use JSON mode.
    return undefined;
  }

  // Successful responses and unrelated JSON must not override failure diagnostics.
  if (
    typeof response !== 'object' ||
    response === null ||
    !('success' in response) ||
    response.success !== false ||
    !('error' in response) ||
    typeof response.error !== 'string'
  ) {
    return undefined;
  }

  const code = 'code' in response && typeof response.code === 'string' ? response.code : '';
  return code ? `${code}: ${response.error}` : response.error;
}
