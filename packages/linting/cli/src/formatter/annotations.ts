import type { Diagnostic } from '@equinor/fusion-framework-lint-core';

/**
 * Formats diagnostics as GitHub Actions workflow commands so they appear as
 * inline annotations on PR diffs.
 *
 * @param diagnostics - Diagnostics to emit as annotation commands.
 * @returns Newline-delimited GitHub Actions annotation strings.
 * @see https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/workflow-commands-for-github-actions#setting-a-warning-message
 */
export function formatAnnotations(diagnostics: Diagnostic[]): string {
  // Map each diagnostic to a GitHub Actions ::warning/::error annotation command
  const lines = diagnostics.map(
    (d) => `::${d.severity} file=${d.file},line=${d.line},col=${d.col}::${d.rule}: ${d.message}`,
  );
  return `${lines.join('\n')}\n`;
}
