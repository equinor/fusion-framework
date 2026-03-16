import { createCommand } from 'commander';
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

import {
  resetDaemon,
  resolveAppKey,
  cleanup,
  waitForServer,
  createRunDir,
} from '../../utils/index.js';
import { runLogin } from './login.js';
import { resolveEvalFiles } from '../../eval-resolve.js';
import { runCopilotEval } from './eval.js';
import type { CopilotEvalOptions } from './types.js';

/**
 * CLI command: `copilot app eval <path>`
 *
 * Evaluates a Fusion application using the GitHub Copilot SDK with
 * `agent-browser` exposed as tools. The Copilot agent autonomously
 * navigates, interacts, and judges the application against eval criteria.
 */
const _appEvalCommand = createCommand('eval')
  .description('Evaluate a Fusion app using Copilot SDK with agent-browser tools')
  .argument('<path>', 'Path to the Fusion application directory')
  .option('--eval <name-or-path>', 'Specific eval to run (name or file path)')
  .option('--port <port>', 'Port for the app server', '3000')
  .option('--host <host>', 'Host for the app server', '0.0.0.0')
  .option('--url <url>', 'Skip server start, use an already-running URL')
  .option('--verbose', 'Show detailed output', false)
  .option('--login', 'Open a headed browser for interactive MSAL login', false)
  .option('-m, --model <model>', 'LLM model to use (e.g. claude-sonnet-4)')
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
      '  $ ffc copilot app eval . --model claude-sonnet-4',
      '  $ ffc copilot app eval . --login',
      '  $ ffc copilot app eval . --url http://localhost:3000/apps/my-app',
    ].join('\n'),
  )
  .action(async (appPath: string, options: CopilotEvalOptions) => {
    const absAppPath = resolve(appPath);
    const port = parseInt(options.port, 10);
    const verbose = options.verbose;

    // ── Login mode: open headed browser for interactive MSAL login ──
    if (options.login) {
      await runLogin(absAppPath, port, options.host);
      return;
    }

    // Resolve eval files
    const evalFiles = resolveEvalFiles(absAppPath, options.eval);
    console.log(
      `📋 Found ${evalFiles.length} eval(s): ${evalFiles.map((f) => basename(f)).join(', ')}`,
    );

    // Start the app dev server (unless --url provides an already-running URL)
    let serverProcess: ChildProcess | undefined;
    let appUrl = options.url;

    if (!appUrl) {
      const pkgJsonPath = join(absAppPath, 'package.json');
      if (!existsSync(pkgJsonPath)) {
        console.error(`❌ No package.json found at ${absAppPath}`);
        process.exit(1);
      }
      const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8')) as { name?: string };
      if (!pkgJson.name) {
        console.error(`❌ package.json at ${absAppPath} has no "name" field`);
        process.exit(1);
      }

      console.log('📦 Resolving app manifest...');
      const appKey = resolveAppKey(absAppPath);
      console.log(`🚀 Starting app server (${appKey})...`);
      serverProcess = spawn(
        'ffc',
        ['app', 'serve', '--host', options.host, '--port', String(port)],
        {
          cwd: absAppPath,
          stdio: verbose ? 'inherit' : 'ignore',
          detached: false,
        },
      );

      const serverUrl = `http://localhost:${port}`;
      const ready = await waitForServer(serverUrl, 60);
      if (!ready) {
        console.error('❌ Server failed to start within 60s');
        cleanup(serverProcess);
        process.exit(1);
      }
      appUrl = `${serverUrl}/apps/${appKey}`;
      console.log(`✅ Server ready at ${appUrl}`);
    }

    let allPassed = true;

    // Kill any stale daemon and clean up profile locks before the run
    resetDaemon();

    // Ctrl+C: clean shutdown of daemon and dev server
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down...');
      resetDaemon();
      cleanup(serverProcess);
      process.exit(130);
    });

    try {
      for (const evalFilePath of evalFiles) {
        const evalName = basename(evalFilePath, '.md');
        console.log(`\n${'═'.repeat(60)}`);
        console.log(`📄 Running eval: ${evalName}`);
        console.log(`${'═'.repeat(60)}`);

        const runDir = createRunDir(evalName, options.output);

        const passed = await runCopilotEval(evalFilePath, appUrl, options, runDir);
        if (!passed) allPassed = false;
      }
    } finally {
      resetDaemon();
      cleanup(serverProcess);
    }

    console.log(`\n${'═'.repeat(60)}`);
    console.log(allPassed ? '✅ ALL EVALS PASSED' : '❌ SOME EVALS FAILED');
    process.exit(allPassed ? 0 : 1);
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
