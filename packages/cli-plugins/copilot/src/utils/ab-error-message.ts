/**
 * Extracts the user-facing error message from an agent-browser failure.
 *
 * Preserves failure codes from JSON stdout so callers do not retry commands
 * whose execution outcome is unknown. Otherwise strips ANSI codes from stderr
 * and returns only the diagnostic
 * lines prefixed with `✗` or `⚠`. Falls back to the first 200 characters
 * of the error message when no diagnostic lines are found.
 *
 * @param err - The caught error (typically from {@link ab})
 * @returns A single-line summary suitable for console output
 * @throws When JSON parsing fails for a reason other than malformed stdout.
 */
export function abErrorMessage(err: unknown): string {
  // Non-Error throws have no structured message to extract
  if (!(err instanceof Error)) return String(err);
  const e = err as Error & { stderr?: string; stdout?: string };
  // JSON mode reports command failures on stdout, including whether retrying is unsafe.
  if (typeof e.stdout === 'string' && e.stdout.trim()) {
    let response: unknown;
    try {
      response = JSON.parse(e.stdout);
    } catch (parseError) {
      // Unstructured stdout is not a failure envelope; retain the original stderr/message below.
      if (!(parseError instanceof SyntaxError)) throw parseError;
    }
    // Do not mistake successful JSON output or unrelated logs for the command's failure.
    if (
      response !== null &&
      typeof response === 'object' &&
      'success' in response &&
      response.success === false &&
      'error' in response &&
      typeof response.error === 'string'
    ) {
      const code = 'code' in response && typeof response.code === 'string' ? response.code : '';
      return code ? `${code}: ${response.error}` : response.error;
    }
  }
  // Prefer the raw stderr stream when it was captured on the error
  if (e.stderr) {
    // biome-ignore lint/suspicious/noControlCharactersInRegex: stripping ANSI escape sequences
    const ansiPattern = /\x1B\[[0-9;]*m/g;
    const lines = e.stderr
      .replace(ansiPattern, '')
      .split('\n')
      // Keep only the diagnostic lines agent-browser prefixes with a status glyph
      .map((l) => l.trim())
      // Filter down to lines that look like agent-browser's own status output
      .filter((l) => l.startsWith('✗') || l.startsWith('⚠'));
    // Only report an assembled diagnostic summary when matching lines were found
    if (lines.length) return lines.join(' | ');
  }
  const match = e.message.match(/[✗⚠].+/);
  return match ? match[0] : e.message.slice(0, 200);
}
