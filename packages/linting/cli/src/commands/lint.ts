import { readFile, writeFile, stat } from 'node:fs/promises';
import { basename } from 'node:path';
import { Command } from 'commander';
import fg from 'fast-glob';
import ora from 'ora';
import { LintEngine } from '@equinor/fusion-framework-lint-core';
import type { LintConfig, Diagnostic } from '@equinor/fusion-framework-lint-core';
import { recommendedConfig, recommendedRules } from '@equinor/fusion-framework-lint-config';
import {
  formatAnnotations,
  formatPretty,
  formatSummary,
  formatRdjsonl,
  formatJson,
  resolveReporter,
} from '../formatter/index.js';

interface LintOptions {
  githubActions?: boolean;
  reporter?: string;
  output?: string;
  rule?: string[];
  diagnosticLevel?: string;
  verbose?: boolean;
}

interface FileResult {
  file: string;
  diagnostics: Diagnostic[];
}

/** Extensions fusion-lint understands, used to expand bare directory arguments into a glob. */
const SUPPORTED_EXTENSIONS = ['ts', 'tsx', 'mts', 'cts'];

/**
 * Expands directory arguments into a recursive glob over supported extensions,
 * so `fusion-lint lint packages/modules/http` works without spelling out
 * `"packages/modules/http/**\/*.ts"`. Patterns that aren't existing directories
 * (plain glob patterns, single files, or paths that don't exist) pass through unchanged.
 */
async function expandPatterns(patterns: string[]): Promise<string[]> {
  return Promise.all(
    // Resolve each pattern to itself, or to a recursive glob if it's a directory
    patterns.map(async (pattern) => {
      try {
        const stats = await stat(pattern);
        // Only directories need expanding — files and globs are already fast-glob-ready
        if (stats.isDirectory()) {
          const normalized = pattern.replace(/\\/g, '/').replace(/\/+$/, '');
          return `${normalized}/**/*.{${SUPPORTED_EXTENSIONS.join(',')}}`;
        }
      } catch {
        // Not an existing filesystem path — treat as a glob pattern as-is
      }
      return pattern;
    }),
  );
}

async function runLint(patterns: string[], options: LintOptions): Promise<void> {
  const reporter = resolveReporter(options.reporter, options.githubActions);
  const isCI = reporter === 'github-actions';
  const isMachineReadable = reporter === 'rdjsonl' || reporter === 'json';

  // Apply per-invocation rule severity overrides on top of the recommended config
  const config: LintConfig = { ...recommendedConfig };
  // Process each --rule=id=severity argument
  for (const override of options.rule ?? []) {
    const eqIdx = override.indexOf('=');
    // Guard: skip malformed overrides that lack a '=' separator
    if (eqIdx === -1) continue;
    config[override.slice(0, eqIdx)] = override.slice(eqIdx + 1) as LintConfig[string];
  }

  const engine = new LintEngine(recommendedRules, config);
  const spinner =
    isCI || isMachineReadable
      ? null
      : ora({ text: 'Resolving file patterns…', color: 'cyan' }).start();

  const files = await fg(await expandPatterns(patterns), {
    absolute: true,
    onlyFiles: true,
    ignore: ['**/node_modules/**', '**/*.d.ts'],
  });

  // Guard: nothing to lint when no files match the provided patterns
  if (files.length === 0) {
    spinner?.warn(`No files matched: ${patterns.join(', ')}`);
    return;
  }

  // Lint each file and collect results before printing (avoids spinner interleaving)
  const results: FileResult[] = [];
  let scanned = 0;

  // Scan files one by one, updating the spinner progress text
  for (const file of files) {
    scanned++;
    // Show live scan progress in the spinner
    if (spinner) {
      spinner.text = `Scanning [${scanned}/${files.length}] ${basename(file)}`;
    }
    const source = await readFile(file, 'utf-8');
    const diagnostics = engine.lint(source, file);
    // Only store files that produced at least one diagnostic
    if (diagnostics.length > 0) results.push({ file, diagnostics });
  }

  const allDiagnostics = results.flatMap((r) => r.diagnostics);
  const errorsOnly = options.diagnosticLevel === 'error';
  // Pre-filter error-severity diagnostics for tallying
  const errorFiltered = allDiagnostics.filter((d) => d.severity === 'error');
  // Tally error-severity diagnostics for exit-code logic
  const errors = errorFiltered.length;
  // Tally warning-severity diagnostics for the summary line
  const warnList = allDiagnostics.filter((d) => d.severity === 'warn');
  const warnings = warnList.length;

  // Stop spinner before printing; its final state is the summary line
  // JSON reporter: emit one document for all files, then exit 0 (report mode — non-blocking)
  if (reporter === 'json') {
    const visibleDiagnostics = errorsOnly ? errorFiltered : allDiagnostics;
    const output = formatJson(visibleDiagnostics, files.length);
    // Write to file when --output is provided, otherwise print to stdout
    if (options.output) {
      await writeFile(options.output, output, 'utf-8');
    } else {
      process.stdout.write(`${output}\n`);
    }
    // JSON is a report, not a gate — always exit 0 so draft-PR jobs stay green
    return;
  }

  // Clean run: nothing to report
  if (errors === 0 && warnings === 0) {
    spinner?.succeed(formatSummary(files.length, 0, 0));
    return;
  }

  // In error-only mode, suppress all output when there are no errors
  if (errorsOnly && errors === 0) {
    spinner?.succeed(formatSummary(files.length, 0, 0));
    return;
  }

  spinner?.stop();

  // Print per-file diagnostics
  for (const { file, diagnostics } of results) {
    // Apply error-only filter: keep only errors when in error-only mode
    const errorSeverity = diagnostics.filter((d) => d.severity === 'error');
    const filtered = errorsOnly ? errorSeverity : diagnostics;
    // Guard: skip files with no visible diagnostics after filtering
    if (filtered.length > 0) {
      // Dispatch to the appropriate formatter based on the active reporter
      if (reporter === 'rdjsonl') {
        process.stdout.write(formatRdjsonl(filtered));
      } else if (isCI) {
        process.stdout.write(formatAnnotations(filtered));
      } else {
        process.stdout.write(formatPretty(file, filtered, options.verbose));
      }
    }
  }

  // CI mode: emit a single summary notice; terminal mode: formatted summary line
  if (isCI) {
    const total = errors + warnings;
    console.log(
      `::notice::Scanned ${files.length} file(s) — ${total} issue(s) (${errors} error(s), ${warnings} warning(s))`,
    );
  } else if (!isMachineReadable) {
    const displayErrors = errorsOnly ? errors : errors;
    const displayWarnings = errorsOnly ? 0 : warnings;
    console.log(`\n${formatSummary(files.length, displayErrors, displayWarnings)}\n`);
  }

  // Exit with non-zero code when there are errors, so CI pipelines fail
  if (errors > 0) process.exit(1);
}

/**
 * Creates a composable `commander` Command for running Fusion lint.
 *
 * Pass `name = 'lint'` when embedding as a sub-command (e.g. `ffc app lint`).
 * Pass `name = 'fusion-lint'` (default) for the standalone binary.
 *
 * @example Standalone binary
 * ```typescript
 * // main.ts
 * const program = createLintCommand('fusion-lint').version('0.1.0');
 * await program.parseAsync();
 * ```
 *
 * @example Embedded in ffc
 * ```typescript
 * // packages/cli — app command
 * import { createLintCommand } from '@equinor/fusion-lint';
 * appCommand.addCommand(createLintCommand());
 * // → ffc app lint packages/modules/http
 * ```
 *
 * @param name - Command name; use `'fusion-lint'` for the standalone binary.
 * @returns A configured `commander` Command instance.
 */
export function createLintCommand(name = 'lint'): Command {
  return new Command(name)
    .description('Run Fusion lint rules on TypeScript source files')
    .argument(
      '<patterns...>',
      'File(s), director(y/ies), or glob pattern(s) of source files to lint',
    )
    .option('--github-actions', 'Alias for --reporter=github-actions (GitHub Actions annotations)')
    .option(
      '--reporter <name>',
      'Output format: pretty (default), github-actions, rdjsonl, json',
      'pretty',
    )
    .option('--output <file>', 'Write output to a file (only used with --reporter=json)')
    .option(
      '--diagnostic-level <level>',
      'Minimum severity to report: "warn" (default) or "error" (suppress warnings)',
      'warn',
    )
    .option('--rule <rule...>', 'Override rule severity  e.g. --rule require-intent-comment=error')
    .option('--verbose', 'Show extended diagnostic descriptions instead of terse rule IDs')
    .action(runLint);
}
