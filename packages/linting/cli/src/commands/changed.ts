import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, extname, basename } from 'node:path';
import { Command } from 'commander';
import ora from 'ora';
import { simpleGit } from 'simple-git';
import type { Diagnostic } from '@equinor/fusion-framework-lint-core';
import {
  formatAnnotations,
  formatPretty,
  formatSummary,
  formatRdjsonl,
  formatJson,
  resolveReporter,
} from '../formatter/index.js';
import { createConfiguredEngine } from '../create-engine.js';

const TS_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts']);

interface ChangedOptions {
  against?: string;
  staged?: boolean;
  githubActions?: boolean;
  reporter?: string;
  output?: string;
  rule?: string[];
  diagnosticLevel?: string;
}

/**
 * Runs `git diff --name-only --diff-filter=ACMR` with the given extra args and
 * returns the list of relative file paths reported by git.
 * Returns an empty array when git is unavailable or the working directory is not
 * inside a git repository.
 *
 * @param args - Extra arguments appended to the git diff command.
 * @returns Relative paths of changed files, or `[]` on failure.
 */
async function gitDiff(args: string[]): Promise<string[]> {
  try {
    const output = await simpleGit().diff(['--name-only', '--diff-filter=ACMR', ...args]);
    // Split the output into individual file paths and discard empty lines
    const lines = output.trim().split('\n').filter(Boolean);
    return lines;
  } catch {
    // Not in a git repository or git binary not found — caller handles the empty result
    return [];
  }
}

/**
 * Returns untracked files that are not ignored by .gitignore.
 * These would never appear in `git diff` output but represent new work.
 *
 * @returns Relative paths of untracked, non-ignored files.
 */
async function gitUntracked(): Promise<string[]> {
  try {
    const output = await simpleGit().raw(['ls-files', '--others', '--exclude-standard']);
    // Split the output into individual file paths and discard empty lines
    const files = output.trim().split('\n').filter(Boolean);
    return files;
  } catch {
    return [];
  }
}

/**
 * Resolves which TypeScript files to lint based on the command options.
 *
 * - `--staged`:        only files in the git index (pre-commit hook usage)
 * - `--against <ref>`: files changed since a specific ref
 * - default:           staged + unstaged edits vs HEAD, plus untracked non-ignored files
 *
 * Results from multiple sources are de-duplicated.  Only existing `.ts/.tsx/.mts/.cts`
 * files are returned.
 *
 * @param options - Parsed command options.
 * @returns Absolute paths of TypeScript files to lint.
 */
async function resolveChangedFiles(options: ChangedOptions): Promise<string[]> {
  const cwd = process.cwd();
  const seen = new Set<string>();

  // Determine which source files to lint based on the command mode
  if (options.staged) {
    // Pre-commit mode: only files added to the index
    for (const f of await gitDiff(['--cached'])) seen.add(f);
  } else if (options.against) {
    // PR / branch mode: everything changed since the given ref
    for (const f of await gitDiff([options.against])) seen.add(f);
  } else {
    // Default: all uncommitted changes — covers staged, unstaged, and brand-new untracked files
    // Include all edits vs HEAD
    for (const f of await gitDiff(['HEAD'])) seen.add(f);
    // Also include index-only changes that don't appear in the working-tree diff
    for (const f of await gitDiff(['--cached'])) seen.add(f);
    // Include untracked new files not shown by any diff
    for (const f of await gitUntracked()) seen.add(f);
  }

  // Keep only TypeScript source files
  const tsFiles = [...seen].filter((f) => TS_EXTENSIONS.has(extname(f)));
  // Resolve each to an absolute path
  const absoluteFiles = tsFiles.map((f) => resolve(cwd, f));
  // Keep only files that still exist on disk (handles deleted-but-staged files)
  const changedTsFiles = absoluteFiles.filter(existsSync);
  return changedTsFiles;
}

async function runChanged(options: ChangedOptions): Promise<void> {
  const reporter = resolveReporter(options.reporter, options.githubActions);
  const isCI = reporter === 'github-actions';
  const isMachineReadable = reporter === 'rdjsonl' || reporter === 'json';

  const modeLabel = options.staged
    ? 'staged files'
    : options.against
      ? `files changed since ${options.against}`
      : 'uncommitted files';

  const spinner =
    isCI || isMachineReadable
      ? null
      : ora({ text: `Detecting ${modeLabel}…`, color: 'cyan' }).start();

  const files = await resolveChangedFiles(options);

  // Guard: nothing to lint when no changed TypeScript files are detected
  if (files.length === 0) {
    spinner?.succeed(`No TypeScript files changed (${modeLabel})`);
    return;
  }

  const engine = await createConfiguredEngine(options.rule);
  const results: Array<{ file: string; diagnostics: Diagnostic[] }> = [];
  let scanned = 0;

  // Lint each file and accumulate results for display
  for (const file of files) {
    scanned++;
    // Update spinner to show live progress through the file list
    if (spinner) spinner.text = `Scanning [${scanned}/${files.length}] ${basename(file)}`;
    const source = await readFile(file, 'utf-8');
    const diagnostics = engine.lint(source, file);
    // Only store files that produced at least one diagnostic
    if (diagnostics.length > 0) results.push({ file, diagnostics });
  }

  const allDiagnostics = results.flatMap((r) => r.diagnostics);
  const errorsOnly = options.diagnosticLevel === 'error';
  // Tally error-severity diagnostics for exit-code logic
  const errorList = allDiagnostics.filter((d) => d.severity === 'error');
  const errors = errorList.length;
  // Tally warning-severity diagnostics for the summary line
  const warnList = allDiagnostics.filter((d) => d.severity === 'warn');
  const warnings = warnList.length;

  // JSON reporter emits a single document for all files — including clean runs, so the AI always gets a report
  if (reporter === 'json') {
    const visibleDiagnostics = errorsOnly ? errorList : allDiagnostics;
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
        process.stdout.write(formatPretty(file, filtered));
      }
    }
  }

  // CI mode: emit a single summary notice; terminal mode: formatted summary line
  if (isCI) {
    const total = errors + warnings;
    const ref = options.staged ? 'staged' : (options.against ?? 'HEAD');
    console.log(
      `::notice::Scanned ${files.length} changed file(s) (vs ${ref}) — ${total} issue(s) (${errors} error(s), ${warnings} warning(s))`,
    );
  } else if (!isMachineReadable) {
    const displayWarnings = errorsOnly ? 0 : warnings;
    console.log(`\n${formatSummary(files.length, errors, displayWarnings)}\n`);
  }

  // Exit with non-zero code when there are errors, so CI pipelines fail
  if (errors > 0) process.exit(1);
}

/**
 * Creates a composable `commander` Command that lints only TypeScript files
 * that have changed in git.
 *
 * Three modes:
 * - **default** (`fusion-lint changed`) — all uncommitted changes vs HEAD
 * - **`--staged`** — only staged files; ideal as a pre-commit hook target
 * - **`--against <ref>`** — files changed since a git ref; ideal for PR CI checks
 *
 * @example Pre-commit hook
 * ```bash
 * fusion-lint changed --staged
 * ```
 *
 * @example PR CI check
 * ```bash
 * fusion-lint changed --against origin/main
 * ```
 *
 * @example Embedded in ffc
 * ```typescript
 * import { createChangedCommand } from '@equinor/fusion-lint';
 * appCommand.addCommand(createChangedCommand());
 * // → ffc app changed --staged
 * ```
 *
 * @param name - Command name when embedding as a sub-command.
 * @returns A configured `commander` Command instance.
 */
export function createChangedCommand(name = 'changed'): Command {
  return new Command(name)
    .description('Lint only TypeScript files changed in git (staged, vs HEAD, or vs a ref)')
    .option('--staged', 'Only lint staged files — ideal for pre-commit hooks')
    .option('--against <ref>', 'Diff against a git ref instead of HEAD  e.g. origin/main')
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
    .action(runChanged);
}
