import { createCommand } from 'commander';
import { basename } from 'node:path';

import { resetDaemon, cleanup, createRunDir } from '../../utils/index.js';
import { runLogin } from './login.js';
import { resolveEvalCommandInput } from '../../resolve-eval-command-input.js';
import { resolveEvalFiles } from '../../resolve-eval-files.js';
import { createSession } from './eval.js';
import { startAppServer } from './server.js';
import { attachSessionLogger } from './session-logger.js';
import type { CopilotEvalOptions, Plan, Verdict } from './types.js';
import { formatVerdict } from './format-verdict.js';
import { existsSync, readFileSync } from 'node:fs';
import { createPlanPrompt } from './prompts/plan.prompt.js';
import { createStepPrompt } from './prompts/step.prompt.js';
import { createJudgePrompt } from './prompts/judge.prompt.js';
import chalk from 'chalk';

/**
 * CLI command: `copilot app eval <path-or-eval>`
 *
 * Evaluates a Fusion application using the GitHub Copilot SDK with
 * `agent-browser` exposed as tools. The Copilot agent autonomously
 * navigates, interacts, and judges the application against eval criteria.
 */
const _appEvalCommand = createCommand('eval')
  .description('Evaluate a Fusion app using Copilot SDK with agent-browser tools')
  .argument('<path-or-eval>', 'Path to the Fusion application directory or an eval markdown file')
  .option('--eval <name-or-path>', 'Specific eval to run (name or file path)')
  .option('--port <port>', 'Port for the app server', '3333')
  .option('--host <host>', 'Host for the app server', '0.0.0.0')
  .option('--url <url>', 'Skip server start, use an already-running URL')
  .option('--verbose', 'Show detailed output', false)
  .option('--logon, --login', 'Open a headed browser for interactive MSAL login', false)
  .option('-m, --model <model>', 'LLM model to use (e.g. claude-sonnet-4)')
  .option('-r, --reasoning <effort>', 'Reasoning effort: low, medium, high, xhigh')
  .option('-o, --output <dir>', 'Output directory for run artifacts')
  .addHelpText(
    'after',
    [
      '',
      'Uses the GitHub Copilot SDK to create an agentic session where the LLM',
      'autonomously drives agent-browser to verify eval criteria.',
      '',
      'Examples:',
      '  $ ffc copilot app eval ./cookbooks/app-react',
      '  $ ffc copilot app eval . --eval smoke',
      '  $ ffc copilot app eval . --eval 06-people-api-page.md',
      '  $ ffc copilot app eval ./cookbooks/app-react-router/eval/06-people-api-page.md',
      '  $ ffc copilot app eval . --model claude-sonnet-4',
      '  $ ffc copilot app eval . --login',
      '  $ ffc copilot app eval . --logon',
      '  $ ffc copilot app eval . --url http://localhost:3333/apps/my-app',
    ].join('\n'),
  )
  .action(async (appOrEvalPath: string, options: CopilotEvalOptions) => {
    const resolvedInput = resolveEvalCommandInput(appOrEvalPath);
    const absAppPath = resolvedInput.appPath;
    const port = parseInt(options.port, 10);
    const verbose = options.verbose;

    // Reject ambiguous input that selects an eval two different ways
    if (resolvedInput.evalFile && options.eval) {
      console.error('❌ Do not combine a positional eval markdown file with --eval');
      process.exit(1);
    }

    // ── Login mode: open headed browser for interactive MSAL login ──
    if (options.login) {
      await runLogin(absAppPath, port, options.host);
      return;
    }

    // Resolve eval files
    const evalFiles = resolvedInput.evalFile
      ? [resolvedInput.evalFile]
      : resolveEvalFiles(absAppPath, options.eval);
    // Summarize which eval files were discovered before the run starts
    const evalFileNames = evalFiles
      // Reduce each resolved eval path down to just its filename for display
      .map((f) => basename(f))
      .join(', ');
    console.log(`📋 Found ${evalFiles.length} eval(s): ${evalFileNames}`);

    // Start the app dev server (unless --url provides an already-running URL)
    const { serverProcess, appUrl } = await startAppServer(absAppPath, {
      port,
      host: options.host,
      url: options.url,
      verbose,
    });

    // Kill any stale daemon and clean up profile locks before the run
    resetDaemon();

    // Track active session logger + session for SIGINT cleanup
    let logger: ReturnType<typeof attachSessionLogger> | null = null;
    let activeSession: Awaited<ReturnType<typeof createSession>> | null = null;

    process.on('SIGINT', () => {
      logger?.stop();
      console.log('\n\n👋 Shutting down...');
      activeSession?.disconnect();
      resetDaemon();
      cleanup(serverProcess);
      process.exit(130);
    });

    let failures = 0;
    try {
      // Run every resolved eval file sequentially so output stays readable
      for (const evalFilePath of evalFiles) {
        const evalName = basename(evalFilePath, '.md');
        const query = readFileSync(evalFilePath, 'utf-8').trim();
        console.log(`\n${'═'.repeat(60)}`);
        console.log(`📄 Running eval: ${evalName}`);
        console.log(`${'═'.repeat(60)}`);

        const runDir = createRunDir(evalName, options.output);

        const ctx = { url: appUrl, outDir: runDir };

        try {
          const sessionConfig = {
            model: options.model,
            ...(options.reasoning ? { reasoningEffort: options.reasoning } : {}),
          };

          // Single session with all tools (browser + file)
          const session = await createSession({ ctx, config: sessionConfig });
          activeSession = session;
          logger = attachSessionLogger(session, { requestedModel: options.model });

          // ── Phase 1: Plan ──────────────────────────────────────────
          await session.sendAndWait({ prompt: createPlanPrompt(query, ctx) }, 300_000);

          const planPath = `${runDir}/plan.json`;
          // Bail out of this eval when the planning phase produced no plan file
          if (!existsSync(planPath)) {
            console.error(
              chalk.red(
                `❌ Agent did not produce ${planPath}. The planning phase may have failed silently.`,
              ),
            );
            session.disconnect();
            logger.stop();
            failures++;
            // Skip execution/judging phases; this eval already failed at planning
            continue;
          }

          const plan = JSON.parse(readFileSync(planPath, 'utf-8')) as Plan;
          console.log(plan.summary);

          // ── Phase 2: Execute + Evaluate each step ──────────────────
          for (const step of plan.steps) {
            console.log(chalk.cyan(`\n── Scenario: ${step.scenario}`));
            // Print each acceptance criterion the agent will be judged against
            for (const c of step.criteria) {
              console.log(chalk.dim(`   • ${c}`));
            }
            await session.sendAndWait({ prompt: createStepPrompt(step, ctx) }, 300_000);
          }

          // ── Phase 3: Judge ─────────────────────────────────────────
          console.log(chalk.cyan('\n── Judging results...'));
          await session.sendAndWait({ prompt: createJudgePrompt(ctx) }, 300_000);

          session.disconnect();
          logger.stop();

          // Print the verdict
          const verdictPath = `${runDir}/verdict.json`;
          // Only report a verdict when the judge phase actually produced one
          if (existsSync(verdictPath)) {
            const verdict = JSON.parse(readFileSync(verdictPath, 'utf-8')) as Verdict;
            console.log(formatVerdict(verdict));
            // A failing verdict counts toward the overall exit-code failure total
            if (!verdict.pass) failures++;
          } else {
            console.error(chalk.red(`❌ Judge did not produce ${verdictPath}.`));
            failures++;
          }
        } catch (err) {
          logger?.stop();
          const msg = err instanceof Error ? err.message : String(err);
          console.error(chalk.red(`\n❌ Eval "${evalName}" failed: ${msg}`));
          // Print the stack trace too when one is available for debugging
          if (err instanceof Error && err.stack) {
            console.error(chalk.dim(err.stack));
          }
          failures++;
        }
      }
    } finally {
      logger?.stop();
      resetDaemon();
      cleanup(serverProcess);
      process.exit(failures > 0 ? 1 : 0);
    }
  });

/** Intermediate `app` command group: `copilot app` */
const _appCommand = createCommand('app')
  .description('Copilot-powered application commands')
  .addCommand(_appEvalCommand);

/**
 * Top-level `copilot` command group.
 *
 * Subcommands:
 *   app eval — Evaluate a Fusion app with Copilot SDK + agent-browser tools
 */
export const copilotCommand = createCommand('copilot')
  .description('GitHub Copilot SDK powered commands')
  .addCommand(_appCommand);
