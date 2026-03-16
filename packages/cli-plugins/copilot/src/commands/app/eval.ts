import { appendFileSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { ab, abErrorMessage } from '../../utils/index.js';
import { createAgentBrowserTools } from './tools/index.js';
import type { CopilotEvalOptions } from './types.js';

/**
 * Lazily imports the Copilot SDK to avoid module resolution errors at CLI startup.
 *
 * The SDK depends on `vscode-jsonrpc/node` which may fail under certain Node versions
 * when loaded eagerly via static imports.
 *
 * @returns The Copilot SDK module namespace
 */
async function loadCopilotSdk(): Promise<typeof import('@github/copilot-sdk')> {
  return await import('@github/copilot-sdk');
}

/**
 * Resolves a tool-provided artifact path to a safe file path within the run evidence directory.
 *
 * @param evidenceDir - Base evidence directory for the current eval run
 * @param requestedPath - Optional path provided by the model/tool call
 * @param fallbackName - Default filename used when no path is provided
 * @returns Absolute artifact path scoped to `evidenceDir`
 */
function resolveEvidencePath(
  evidenceDir: string,
  requestedPath: string | undefined,
  fallbackName: string,
): string {
  const fileName = requestedPath ? basename(requestedPath) : fallbackName;
  return join(evidenceDir, fileName);
}

/**
 * Creates the `agent-browser` tool definitions for the Copilot SDK session.
 *
 * Each tool wraps an `agent-browser` CLI subcommand so the Copilot agent can
 * autonomously navigate and inspect a running Fusion application.
 *
 * @param evidenceDir - Directory where evidence artifacts (snapshots, errors) are saved
 * @param verbose - Whether to log commands to the console
 * @param defineTool - The `defineTool` helper from the Copilot SDK
 * @returns Array of Copilot SDK tool definitions for browser interaction
 */
function createBrowserTools(
  evidenceDir: string,
  verbose: boolean,
  defineTool: Awaited<ReturnType<typeof loadCopilotSdk>>['defineTool'],
): ReturnType<typeof createAgentBrowserTools> {
  const runAb = (args: string[], timeoutMs = 30_000): string => {
    if (verbose) console.log(`    $ agent-browser ${args.join(' ')}`);
    try {
      return ab(args, timeoutMs);
    } catch (err) {
      const msg = abErrorMessage(err);
      if (verbose) console.log(`    ⚠ ${msg}`);
      return `Error: ${msg}`;
    }
  };

  return createAgentBrowserTools(
    {
      evidenceDir,
      runAb,
      resolveEvidencePath: (requestedPath, fallbackName) =>
        resolveEvidencePath(evidenceDir, requestedPath, fallbackName),
    },
    defineTool,
  );
}

/**
 * Builds the system message for the Copilot session.
 *
 * Instructs the agent to act as a QA tester that navigates a Fusion application,
 * verifies acceptance criteria, and produces a structured verdict.
 *
 * @param appUrl - Base URL of the running Fusion application
 * @returns System prompt string for the Copilot session
 */
function buildSystemMessage(appUrl: string): string {
  return [
    'You are a QA tester evaluating a Fusion Framework web application.',
    '',
    `The application is running at: ${appUrl}`,
    'The app content is rendered inside a <section id="app-section"> element.',
    'Use "#app-section" as the root selector for targeted CSS inspections.',
    '',
    'Hard constraints (must follow):',
    '- Use ONLY the provided browser_* tools.',
    '- Do NOT inspect repository files or source code (including cookbooks, src, tests, docs, or terminal logs).',
    '- Do NOT infer PASS from user story text alone. PASS only when directly observed in browser evidence.',
    '',
    'Evidence workflow:',
    '- Navigate to the app URL first.',
    '- Wait for network idle before making assertions.',
    '- For each acceptance criterion, collect fresh evidence before deciding.',
    '- For text/structure criteria, use browser_snapshot and quote the observed text/element in notes.',
    '- For visual/appearance criteria (color, spacing, alignment, layout, overflow, visibility, etc.):',
    '  1. Choose the evidence method that best fits the criterion.',
    '  2. Use browser_get_styles or browser_eval for exact CSS-value checks (e.g. explicit color/size/spacing requirements).',
    '  3. Use browser_screenshot when the criterion is perceptual or render-dependent (e.g. overlap, clipping, visual hierarchy).',
    '  4. Combine CSS + screenshot + snapshot when needed for confidence.',
    '  5. Prefer computed styles for exact color assertions; use screenshot as supporting visual evidence.',
    '  6. Avoid redundant captures — take at most ONE screenshot per criterion unless an extra view is necessary.',
    '  7. If evidence is ambiguous or conflicting, explain it and mark the criterion as failed.',
    '- Near the end, call browser_errors and browser_get_url.',
    '- If required evidence for a criterion is missing, mark that criterion as failed.',
    '',
    'When done testing, output your final verdict as JSON:',
    '```json',
    '{',
    '  "pass": true|false,',
    '  "reasoning": "overall summary",',
    '  "steps": [',
    '    { "instruction": "what was checked", "ok": true|false, "note": "observation", "evidence": ["snapshot.txt", "screenshot-1.png"] }',
    '  ]',
    '}',
    '```',
    '',
    'Be strict: if JS errors appear, pages are blank, or expected elements are missing, fail.',
    'Be lenient on cosmetic issues or minor warnings.',
  ].join('\n');
}

/** Structured verdict produced by the Copilot agent at the end of an eval session. */
interface Verdict {
  /** Whether all acceptance criteria passed. */
  pass: boolean;
  /** Overall summary explaining the pass/fail outcome. */
  reasoning: string;
  /** Per-criterion results with evidence references. */
  steps: Array<{
    /** Description of the criterion that was checked. */
    instruction: string;
    /** Whether this criterion passed. */
    ok: boolean;
    /** Observation or explanation for the result. */
    note: string;
    /** Filenames of collected evidence artifacts. */
    evidence?: string[];
  }>;
}

/**
 * Runs a Copilot SDK session with agent-browser tools to evaluate a user story.
 *
 * The eval file markdown is passed directly to the Copilot agent, which
 * autonomously plans, executes, and judges in a single conversational session
 * with browser tools.
 *
 * @param evalFilePath - Absolute path to the eval markdown file
 * @param appUrl - URL where the app is running
 * @param options - CLI options
 * @param runDir - Directory for persisting artifacts
 * @returns `true` if the eval passed, `false` otherwise
 */
export async function runCopilotEval(
  evalFilePath: string,
  appUrl: string,
  options: CopilotEvalOptions,
  runDir: string,
): Promise<boolean> {
  const evidenceDir = join(runDir, 'evidence');
  mkdirSync(evidenceDir, { recursive: true });

  const { CopilotClient, defineTool, approveAll } = await loadCopilotSdk();

  const tools = createBrowserTools(evidenceDir, options.verbose, defineTool);
  const availableTools = tools.map((tool) => tool.name);
  const systemMessage = buildSystemMessage(appUrl);

  // Read the eval file and pass its raw markdown as the user prompt
  const evalMarkdown = readFileSync(evalFilePath, 'utf-8');
  const userPrompt = [
    evalMarkdown,
    '',
    'Verify the above by interacting with the running application using browser tools only.',
    'Do not inspect source files, cookbooks, or repository content.',
    'Collect evidence for each criterion using the most suitable tool: snapshots for structure/text, CSS inspection (browser_get_styles or browser_eval) for exact style values, and screenshots for perceptual visual checks when needed.',
    'Check browser errors and provide a structured JSON verdict at the end.',
  ].join('\n');

  const { default: ora } = await import('ora');
  const spinner = ora({
    text: `Starting Copilot session${options.model ? ` [${options.model}]` : ''}`,
    prefixText: '\n',
  }).start();

  const client = new CopilotClient({ autoStart: true });

  try {
    await client.start();
    spinner.text = 'Creating session with browser tools…';

    const session = await client.createSession({
      model: options.model,
      tools,
      availableTools,
      systemMessage: { mode: 'replace', content: systemMessage },
      streaming: true,
      onPermissionRequest: approveAll,
    });

    spinner.succeed('Copilot session active');

    let finalMessage = '';

    // Send the eval prompt and wait for the agent to finish
    const result = await new Promise<string>((resolve, reject) => {
      const chunks: string[] = [];

      session.on((event) => {
        switch (event.type) {
          case 'assistant.message_delta':
            process.stdout.write(event.data.deltaContent);
            chunks.push(event.data.deltaContent);
            break;
          case 'assistant.message':
            finalMessage = event.data.content;
            break;
          case 'tool.execution_start': {
            const logEntry = JSON.stringify({
              timestamp: new Date().toISOString(),
              tool: event.data.toolName,
              args: event.data.arguments,
            });
            appendFileSync(join(runDir, 'copilot-log.jsonl'), `${logEntry}\n`, 'utf-8');
            console.log(`\n   🔧 ${event.data.toolName}(${JSON.stringify(event.data.arguments)})`);
            break;
          }
          case 'session.idle':
            resolve(finalMessage || chunks.join(''));
            break;
          case 'session.error':
            reject(new Error(event.data.message));
            break;
        }
      });

      session.send({ prompt: userPrompt });
    });

    // Save the full response
    writeFileSync(join(runDir, 'copilot-response.md'), result, 'utf-8');

    // Try to parse the verdict from the response
    const verdict = parseVerdict(result);
    writeFileSync(join(runDir, 'verdict.json'), JSON.stringify(verdict, null, 2), 'utf-8');

    console.log('');
    console.log(verdict.pass ? '✅ EVAL PASSED' : '❌ EVAL FAILED');
    console.log(`   ${verdict.reasoning}`);
    console.log('');

    for (const s of verdict.steps) {
      const icon = s.ok ? '✓' : '✗';
      console.log(`   ${icon} ${s.instruction}`);
      if (s.note) console.log(`     ${s.note}`);
      if (s.evidence && s.evidence.length > 0) {
        console.log(`     evidence: ${s.evidence.join(', ')}`);
      }
    }

    await session.destroy();
    return verdict.pass;
  } finally {
    await client.stop();
  }
}

/**
 * Extracts a JSON verdict from the Copilot agent's response text.
 *
 * Strips markdown fences, finds the outermost JSON object, and validates
 * that it contains the expected `pass` and `reasoning` fields.
 *
 * @param text - Raw response text from the Copilot agent
 * @returns Parsed verdict, or a failing default when parsing fails
 */
function parseVerdict(text: string): Verdict {
  // Strip markdown fences
  const stripped = text.replace(/```json\n?/g, '').replace(/\n?```/g, '');
  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) {
    return {
      pass: false,
      reasoning: 'Could not parse verdict from agent response',
      steps: [{ instruction: 'Parse verdict', ok: false, note: text.slice(0, 500) }],
    };
  }
  try {
    const parsed: unknown = JSON.parse(match[0]);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'pass' in parsed &&
      'reasoning' in parsed
    ) {
      return parsed as Verdict;
    }
  } catch {
    // Fall through to default
  }
  return {
    pass: false,
    reasoning: 'Could not parse verdict from agent response',
    steps: [{ instruction: 'Parse verdict', ok: false, note: text.slice(0, 500) }],
  };
}
