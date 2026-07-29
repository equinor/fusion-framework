/**
 * Extracts the user-facing error message from an agent-browser failure.
 *
 * Strips ANSI escape codes from stderr and returns only the diagnostic
 * lines prefixed with `✗` or `⚠`. Falls back to the first 200 characters
 * of the error message when no diagnostic lines are found.
 *
 * @param err - The caught error (typically from {@link ab})
 * @returns A single-line summary suitable for console output
 */
export function abErrorMessage(err: unknown): string {
  // Non-Error throws have no structured message to extract
  if (!(err instanceof Error)) return String(err);
  const e = err as Error & { stderr?: string };
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
