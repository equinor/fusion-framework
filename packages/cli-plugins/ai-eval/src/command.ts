import { createCommand } from 'commander';
import { copyFileSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { ab } from './utils/agent-browser.js';
import { withOptions, type AiOptions } from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';
import { setupFramework } from '@equinor/fusion-framework-cli-plugin-ai-base';
import { createBrowserTools } from './browser-tools.js';
import { plan, explore, judge, sanitiseEvidence } from './agent/index.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EvalOptions extends AiOptions {
  /** Base URL of the running application (required). */
  url: string;
  /** Output directory for run artifacts. */
  output: string;
  /** Print tool calls and evidence as collected. */
  verbose: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolves `inputPath` to a list of `.md` eval files to run.
 *
 * - If `inputPath` is a file with a `.md` extension: returns `[inputPath]`.
 * - If `inputPath` is a directory: returns all `.md` files inside it (non-recursive).
 */
function resolveEvalFiles(inputPath: string): string[] {
  const abs = resolve(inputPath);
  const stat = statSync(abs);

  if (stat.isFile()) {
    if (extname(abs) !== '.md') {
      throw new Error(`Expected a Markdown file (.md), got: ${abs}`);
    }
    return [abs];
  }

  if (stat.isDirectory()) {
    const entries = readdirSync(abs);
    const mdFiles = entries
      .filter((e) => extname(e) === '.md')
      .map((e) => join(abs, e))
      .filter((p) => statSync(p).isFile());

    if (mdFiles.length === 0) {
      throw new Error(`No .md files found in directory: ${abs}`);
    }
    return mdFiles;
  }

  throw new Error(`Path is neither a file nor a directory: ${abs}`);
}

/** Produces a compact ISO-like run ID: `20260529-143022`. */
function makeRunId(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join('') + '-' + [
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('');
}

/** Maps a verdict result to a process exit code. */
function exitCodeFor(result: 'PASS' | 'FAIL' | 'INCONCLUSIVE'): number {
  if (result === 'PASS') return 0;
  if (result === 'FAIL') return 1;
  return 2;
}

// ---------------------------------------------------------------------------
// Command definition
// ---------------------------------------------------------------------------

const _command = createCommand('eval')
  .argument('<path>', 'Path to an eval .md file or a directory containing eval .md files')
  .description(
    'Run agentic acceptance tests against a locally running Fusion app.\n\n' +
      'The command runs a 4-phase pipeline (Plan → Explore → Sanitise → Judge)\n' +
      'for each eval story and writes artifacts to --output.',
  )
  .requiredOption('--url <url>', 'Base URL of the running application (required)')
  .option('--output <dir>', 'Directory to write run artifacts to', './eval-results')
  .option('--verbose', 'Print tool calls and evidence as collected', false);

withOptions(_command, { includeChat: true });

_command.action(async (inputPath: string, options: EvalOptions) => {
  let evalFiles: string[];

  try {
    evalFiles = resolveEvalFiles(inputPath);
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  console.log(`\n🚀 Fusion AI Eval — ${evalFiles.length} story file(s)`);
  console.log(`   App URL : ${options.url}`);
  console.log(`   Output  : ${options.output}`);

  // Initialise the Fusion Framework with the AI module
  const framework = await setupFramework(options);
  const model = framework.ai.useModel(options.chatModel);

  // Browser tools are shared across all stories in this run
  const tools = createBrowserTools();

  const outputDir = resolve(options.output);
  mkdirSync(outputDir, { recursive: true });

  const overallResults: Array<{ file: string; result: string }> = [];

  const runId = makeRunId();

  for (const storyFile of evalFiles) {
    const storyName = basename(storyFile, '.md');
    const storyMarkdown = readFileSync(storyFile, 'utf-8');
    // Each run gets its own timestamped subfolder: eval-results/{storyName}/{runId}/
    const storyOutputDir = join(outputDir, storyName, runId);
    mkdirSync(storyOutputDir, { recursive: true });

    // Copy the story into the run folder so `ffc ai judge <run-dir>` can find it
    copyFileSync(storyFile, join(storyOutputDir, 'story.md'));

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📖 Story: ${storyName}`);

    try {
      // ── Phase 1: Plan ──────────────────────────────────────────────────
      const testPlan = await plan(storyMarkdown, model, { verbose: options.verbose });

      writeFileSync(
        join(storyOutputDir, 'plan.json'),
        JSON.stringify(testPlan, null, 2),
        'utf-8',
      );

      if (options.verbose) {
        console.log(`  Plan saved → ${join(storyOutputDir, 'plan.json')}`);
      }

      // ── Phase 2 + 3: Explore + Sanitise (per step) ────────────────────
      const proofs = [];

      for (const step of testPlan.steps) {
        // Each step gets its own evidence subfolder
        const evidenceDir = join(storyOutputDir, 'evidence', step.id);
        mkdirSync(evidenceDir, { recursive: true });

        // Phase 2: Explorer — collect raw evidence
        const toolLogPath = join(evidenceDir, 'verifications.jsonl');
        const evidence = await explore(step, options.url, model, tools, {
          verbose: options.verbose,
          toolLogPath,
        });

        // Capture browser console logs (all levels: log/warn/error/info)
        try {
          const consoleLogs = ab(['console', '--json']);
          writeFileSync(join(evidenceDir, 'browser-log.json'), consoleLogs, 'utf-8');
        } catch { /* non-fatal */ }

        // Copy screenshot into the evidence subfolder
        const snapshotFile = join(evidenceDir, 'snapshot.yml');
        if (evidence.screenshotPath) {
          const ext = evidence.screenshotPath.split('.').pop() ?? 'jpg';
          const dest = join(evidenceDir, `screenshot.${ext}`);
          try {
            copyFileSync(evidence.screenshotPath, dest);
            evidence.screenshotPath = dest;
          } catch {
            // Non-fatal — keep the original temp path
          }
        }

        // Persist snapshot
        writeFileSync(snapshotFile, evidence.snapshot, 'utf-8');

        // Phase 3: Sanitise — strip internal metadata before the Judge sees it
        const proof = sanitiseEvidence(evidence, step);
        proofs.push(proof);
      }

      // Persist sanitised proofs — snapshot referenced by path in evidence subfolder
      writeFileSync(
        join(storyOutputDir, 'proofs.json'),
        JSON.stringify(
          proofs.map((p) => ({
            ...p,
            snapshot: undefined,
            snapshotPath: join(storyOutputDir, 'evidence', p.stepId, 'snapshot.yml'),
          })),
          null, 2,
        ),
        'utf-8',
      );

      // ── Phase 4: Judge ─────────────────────────────────────────────────
      const verdict = await judge(proofs, storyMarkdown, model, { verbose: options.verbose });

      writeFileSync(
        join(storyOutputDir, 'verdict.json'),
        JSON.stringify(verdict, null, 2),
        'utf-8',
      );

      const icon = verdict.result === 'PASS' ? '✅' : verdict.result === 'FAIL' ? '❌' : '❓';
      console.log(`\n${icon} ${storyName}: ${verdict.result}`);
      console.log(`   ${verdict.summary}`);

      if (verdict.failingCriteria.length > 0) {
        console.log('   Failing criteria:');
        for (const c of verdict.failingCriteria) {
          console.log(`     • ${c}`);
        }
      }

      overallResults.push({ file: storyName, result: verdict.result });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`\n💥 ${storyName}: ERROR — ${message}`);
      overallResults.push({ file: storyName, result: 'ERROR' });
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log(`\n${'═'.repeat(60)}`);
  console.log('Summary:');
  for (const { file, result } of overallResults) {
    const icon =
      result === 'PASS' ? '✅' : result === 'FAIL' ? '❌' : result === 'ERROR' ? '💥' : '❓';
    console.log(`  ${icon} ${file}: ${result}`);
  }

  // Exit with the worst exit code across all stories
  const hasError = overallResults.some((r) => r.result === 'ERROR');
  const hasFail = overallResults.some((r) => r.result === 'FAIL');
  const hasInconclusive = overallResults.some((r) => r.result === 'INCONCLUSIVE');

  if (hasError || hasFail) {
    process.exit(1);
  } else if (hasInconclusive) {
    process.exit(2);
  } else {
    process.exit(0);
  }
});

export { _command as command };
