import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  realpathSync,
  appendFileSync,
} from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { createPatch } from 'diff';
import { WebSocketServer, type RawData, type WebSocket } from 'ws';
import type {
  ChangeSet,
  ChatSendRequest,
  ClientRequest,
  FileOperation,
  LiveAiServer,
  ServerEvent,
  StartServerOptions,
} from './types.js';
import { AVAILABLE_AGENTS, AVAILABLE_MODELS } from './config.js';

interface SessionState {
  changeSets: Map<string, ChangeSet>;
}

interface RuntimeCatalog {
  agents: string[];
  models: string[];
}

interface CopilotRuntimeStatus {
  installed: boolean;
  ready: boolean;
  message: string;
}

/**
 * Starts the experimental local write server.
 *
 * @param options - Server startup options.
 * @returns Running server handle with close function.
 */
export async function startServer(options: StartServerOptions = {}): Promise<LiveAiServer> {
  const root = resolveConfiguredRoot(options.root);
  const rootRealPath = realpathSync(root);
  const port = options.port ?? 8787;
  const persistAuditLog = options.persistAuditLog ?? true;
  const sessions = new Map<string, SessionState>();
  const copilotStatus = await detectCopilotRuntimeStatus(root);
  const runtimeCatalog = await discoverRuntimeCatalog(copilotStatus);

  const server = new WebSocketServer({ port });

  server.on('connection', (socket: WebSocket) => {
    emit(socket, {
      type: 'config',
      agents: runtimeCatalog.agents,
      models: runtimeCatalog.models,
    });
    emit(socket, {
      type: 'log',
      level: 'info',
      message: `Connected to live-ai server at root ${root}`,
    });
    emit(socket, {
      type: 'log',
      level: copilotStatus.ready ? 'info' : 'warn',
      message: copilotStatus.message,
    });

    socket.on('message', async (rawData: RawData) => {
      try {
        const request = parseClientRequest(rawData.toString());
        await handleRequest({
          request,
          socket,
          root,
          rootRealPath,
          persistAuditLog,
          sessions,
          runtimeCatalog,
          copilotStatus,
        });
      } catch (error) {
        emit(socket, {
          type: 'error',
          message: toErrorMessage(error),
        });
      }
    });
  });

  return {
    root,
    port,
    close: async () => {
      await new Promise<void>((resolvePromise, rejectPromise) => {
        server.close((error?: Error) => {
          if (error) {
            rejectPromise(error);
            return;
          }
          resolvePromise();
        });
      });
    },
  };
}

interface HandleRequestContext {
  request: ClientRequest;
  socket: WebSocket;
  root: string;
  rootRealPath: string;
  persistAuditLog: boolean;
  sessions: Map<string, SessionState>;
  runtimeCatalog: RuntimeCatalog;
  copilotStatus: CopilotRuntimeStatus;
}

async function handleRequest(ctx: HandleRequestContext): Promise<void> {
  if (ctx.request.type === 'chat.send') {
    await handleChatSend(ctx, ctx.request);
    return;
  }

  if (ctx.request.type === 'changes.apply') {
    const state = ensureSession(ctx.sessions, ctx.request.sessionId);
    const changeSet = state.changeSets.get(ctx.request.changeSetId);
    if (!changeSet) {
      throw new Error(`No proposed change set found: ${ctx.request.changeSetId}`);
    }

    for (const operation of changeSet.files) {
      applyFileOperation(ctx.rootRealPath, operation);
    }

    if (ctx.persistAuditLog) {
      appendAuditLog(ctx.root, ctx.request.sessionId, {
        type: 'changes.applied',
        sessionId: ctx.request.sessionId,
        changeSetId: ctx.request.changeSetId,
        appliedAt: new Date().toISOString(),
      });
    }

    emit(ctx.socket, {
      type: 'changes.applied',
      sessionId: ctx.request.sessionId,
      changeSetId: ctx.request.changeSetId,
    });
    return;
  }

  if (ctx.request.type === 'changes.reject') {
    const state = ensureSession(ctx.sessions, ctx.request.sessionId);
    state.changeSets.delete(ctx.request.changeSetId);

    if (ctx.persistAuditLog) {
      appendAuditLog(ctx.root, ctx.request.sessionId, {
        type: 'changes.rejected',
        sessionId: ctx.request.sessionId,
        changeSetId: ctx.request.changeSetId,
        rejectedAt: new Date().toISOString(),
      });
    }

    emit(ctx.socket, {
      type: 'changes.rejected',
      sessionId: ctx.request.sessionId,
      changeSetId: ctx.request.changeSetId,
    });
  }
}

async function handleChatSend(ctx: HandleRequestContext, request: ChatSendRequest): Promise<void> {
  if (!ctx.copilotStatus.ready) {
    emit(ctx.socket, {
      type: 'log',
      level: 'warn',
      message: ctx.copilotStatus.message,
    });
    emit(ctx.socket, {
      type: 'error',
      message:
        'Copilot is not ready. Install and authenticate Copilot CLI, then restart live-ai server.',
    });
    emit(ctx.socket, { type: 'done', sessionId: request.sessionId });
    return;
  }

  const timestamp = new Date().toISOString();
  const normalizedAgent = normalizeCopilotAgent(request.agent, ctx.runtimeCatalog);
  const selectedModel = normalizeCopilotModel(request.model, ctx.runtimeCatalog);
  const runtimeSelection = [normalizedAgent ?? 'default', selectedModel]
    .filter(Boolean)
    .join(' / ');

  if (ctx.persistAuditLog) {
    appendAuditLog(ctx.root, request.sessionId, {
      type: 'chat.send',
      sessionId: request.sessionId,
      message: request.message,
      mode: request.mode,
      agent: normalizedAgent ?? 'default',
      model: selectedModel,
      createdAt: timestamp,
    });
  }

  emit(ctx.socket, {
    type: 'log',
    level: 'info',
    message: 'Received prompt. Running Copilot apply flow.',
  });

  if (runtimeSelection) {
    emit(ctx.socket, {
      type: 'log',
      level: 'info',
      message: `Using runtime selection: ${runtimeSelection}`,
    });
  }

  const copilotResult = await runCopilotApply(
    request.message,
    ctx.root,
    {
      model: selectedModel,
      agent: normalizedAgent,
    },
    (progress) => {
      emit(ctx.socket, {
        type: 'log',
        level: 'info',
        message: progress,
      });
    },
  );

  if (copilotResult.ok) {
    for (const token of tokenize(copilotResult.assistantText)) {
      emit(ctx.socket, { type: 'assistant.token', sessionId: request.sessionId, token });
    }

    const changeSetId = createId('changeset');

    if (ctx.persistAuditLog) {
      appendAuditLog(ctx.root, request.sessionId, {
        type: 'changes.applied',
        sessionId: request.sessionId,
        changeSetId,
        appliedAt: new Date().toISOString(),
        pathway: 'copilot-cli',
      });
    }

    emit(ctx.socket, {
      type: 'changes.applied',
      sessionId: request.sessionId,
      changeSetId,
    });
    emit(ctx.socket, { type: 'done', sessionId: request.sessionId });
    return;
  }

  emit(ctx.socket, {
    type: 'log',
    level: 'warn',
    message: `Copilot apply unavailable: ${copilotResult.message}`,
  });
  emit(ctx.socket, {
    type: 'log',
    level: 'info',
    message: 'Falling back to local draft planner for this request.',
  });

  const draft = createDraftChange(ctx.rootRealPath, request.message);

  emit(ctx.socket, {
    type: 'log',
    level: 'info',
    message: `Fallback planned write operation: ${draft.file.path}`,
  });

  for (const token of tokenize(`Fallback mode: ${draft.summary}`)) {
    emit(ctx.socket, { type: 'assistant.token', sessionId: request.sessionId, token });
  }

  applyFileOperation(ctx.rootRealPath, draft.file);

  const fallbackChangeSetId = createId('changeset');
  if (ctx.persistAuditLog) {
    appendAuditLog(ctx.root, request.sessionId, {
      type: 'changes.applied',
      sessionId: request.sessionId,
      changeSetId: fallbackChangeSetId,
      appliedAt: new Date().toISOString(),
      pathway: 'fallback-local-draft',
      target: draft.file.path,
    });
  }

  emit(ctx.socket, {
    type: 'changes.applied',
    sessionId: request.sessionId,
    changeSetId: fallbackChangeSetId,
  });
  emit(ctx.socket, { type: 'done', sessionId: request.sessionId });
}

interface CopilotApplyOptions {
  model?: string;
  agent?: string;
}

function normalizeCopilotModel(model: string | undefined, catalog: RuntimeCatalog): string {
  const fallbackModel = catalog.models[0] ?? AVAILABLE_MODELS[0];
  if (!model) {
    return fallbackModel;
  }

  const normalized = model.trim();
  if (!normalized) {
    return fallbackModel;
  }

  return catalog.models.includes(normalized) ? normalized : fallbackModel;
}

function normalizeCopilotAgent(
  agent: string | undefined,
  catalog: RuntimeCatalog,
): string | undefined {
  if (!agent) {
    return undefined;
  }

  const normalized = agent.trim().toLowerCase();
  if (!normalized || normalized === 'default') {
    return undefined;
  }

  return catalog.agents.includes(normalized) ? normalized : undefined;
}

async function discoverRuntimeCatalog(
  copilotStatus: CopilotRuntimeStatus,
): Promise<RuntimeCatalog> {
  const fallbackModels = AVAILABLE_MODELS.slice();
  const fallbackAgents = AVAILABLE_AGENTS.slice();

  if (!copilotStatus.installed) {
    return {
      agents: ['default'],
      models: fallbackModels,
    };
  }

  const [models, detectedAgents] = await Promise.all([
    discoverCopilotModels(),
    discoverCopilotAgents(),
  ]);

  const runtimeAgents = new Set<string>(['default']);
  for (const agent of detectedAgents) {
    runtimeAgents.add(agent);
  }

  const agents = runtimeAgents.size > 0 ? [...runtimeAgents] : fallbackAgents;
  const runtimeModels = models.length > 0 ? models : fallbackModels;

  return {
    agents,
    models: runtimeModels,
  };
}

async function discoverCopilotModels(): Promise<string[]> {
  const result = await runToolCommand('copilot', ['--help'], process.cwd(), 10000);
  if (!result.ok) {
    return [];
  }

  const source = `${result.stdout}\n${result.stderr}`;
  const modelSection = source.slice(source.indexOf('--model <model>'));
  if (!modelSection) {
    return [];
  }

  const match = modelSection.match(/\(choices:\s*([\s\S]*?)\)/);
  if (!match) {
    return [];
  }

  const found = [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
  return Array.from(new Set(found));
}

async function detectCopilotRuntimeStatus(cwd: string): Promise<CopilotRuntimeStatus> {
  const installCheck = await runToolCommand('copilot', ['--version'], cwd, 8000);
  if (!installCheck.ok) {
    return {
      installed: false,
      ready: false,
      message:
        'Copilot CLI is not installed or not on PATH. Install Copilot CLI, then restart live-ai server.',
    };
  }

  return {
    installed: true,
    ready: true,
    message:
      'Copilot CLI detected. Live-AI will run Copilot automatically for prompts (authenticate on first run if needed).',
  };
}

async function discoverCopilotAgents(): Promise<string[]> {
  const result = await runToolCommand(
    'copilot',
    [
      '--agent',
      '__live_ai_invalid_agent__',
      '-p',
      'noop',
      '--allow-all',
      '--no-ask-user',
      '--model',
      AVAILABLE_MODELS[0],
      '--stream',
      'off',
    ],
    process.cwd(),
    12000,
  );

  const source = `${result.stdout}\n${result.stderr}`;
  const match = source.match(/available:\s*([^\n\r]+)/i);
  if (!match) {
    return [];
  }

  return Array.from(
    new Set(
      match[1]
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter((value) => value.length > 0),
    ),
  );
}

interface ToolCommandResult {
  ok: boolean;
  stdout: string;
  stderr: string;
}

async function runToolCommand(
  command: string,
  args: string[],
  cwd: string,
  timeoutMs: number,
): Promise<ToolCommandResult> {
  return new Promise((resolvePromise) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let settled = false;

    const settle = (result: ToolCommandResult) => {
      if (settled) {
        return;
      }
      settled = true;
      resolvePromise(result);
    };

    const timeoutId = setTimeout(() => {
      child.kill('SIGTERM');
      settle({
        ok: false,
        stdout,
        stderr: `${stderr}\nCommand timed out after ${timeoutMs}ms.`,
      });
    }, timeoutMs);

    child.stdout.on('data', (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      clearTimeout(timeoutId);
      settle({
        ok: false,
        stdout,
        stderr: `${stderr}\n${toErrorMessage(error)}`,
      });
    });

    child.on('close', (code) => {
      clearTimeout(timeoutId);
      settle({
        ok: code === 0,
        stdout,
        stderr,
      });
    });
  });
}

interface CopilotApplyResult {
  ok: boolean;
  message: string;
  assistantText: string;
}

async function runCopilotApply(
  prompt: string,
  cwd: string,
  options: CopilotApplyOptions,
  onProgress: (message: string) => void,
): Promise<CopilotApplyResult> {
  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) {
    return {
      ok: false,
      message: 'Prompt is empty.',
      assistantText: 'No prompt was provided.',
    };
  }

  const executionPrompt = [
    'Act as an autonomous developer in this repository.',
    'Apply the requested change directly with the smallest practical edit.',
    'Prefer the current working directory and the currently running dev target.',
    'Avoid broad repository exploration unless it is strictly necessary to make the edit.',
    'If the request is ambiguous, choose the most user-visible change in the current dev target and keep the edit minimal.',
    'Create new files when needed, keep modifications minimal and TypeScript-safe.',
    'Do not run builds, tests, linters, diff checks, or validation steps unless the user explicitly asked for them.',
    'Do not ask questions. Perform changes and finish.',
    `User request: ${trimmedPrompt}`,
  ].join('\n');

  const args = [
    '-p',
    executionPrompt,
    '--allow-all',
    '--no-ask-user',
    '--model',
    options.model ?? 'gpt-5.3-codex',
    '--stream',
    'on',
  ];

  if (options.agent) {
    args.push('--agent', options.agent);
  }

  return new Promise((resolvePromise) => {
    const child = spawn('copilot', args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let stdoutBuffer = '';
    let stderrBuffer = '';
    let settled = false;

    const resolveOnce = (result: CopilotApplyResult) => {
      if (settled) {
        return;
      }
      settled = true;
      resolvePromise(result);
    };

    const flushLines = (
      buffer: string,
      sink: 'stdout' | 'stderr',
      messagePrefix?: string,
    ): string => {
      const lines = buffer.split(/\r?\n/);
      const remainder = lines.pop() ?? '';
      for (const line of lines) {
        const sanitized = sanitizeCopilotOutputLine(line);
        if (!sanitized) {
          continue;
        }

        if (sink === 'stdout') {
          stdout += `${sanitized}\n`;
        } else {
          stderr += `${sanitized}\n`;
        }

        onProgress(messagePrefix ? `${messagePrefix}${sanitized}` : sanitized);
      }
      return remainder;
    };

    child.stdout.on('data', (chunk: Buffer | string) => {
      stdoutBuffer += chunk.toString();
      stdoutBuffer = flushLines(stdoutBuffer, 'stdout');
    });

    child.stderr.on('data', (chunk: Buffer | string) => {
      stderrBuffer += chunk.toString();
      stderrBuffer = flushLines(stderrBuffer, 'stderr', 'stderr: ');
    });

    child.on('error', (error) => {
      resolveOnce({
        ok: false,
        message: `Failed to start copilot CLI: ${toErrorMessage(error)}`,
        assistantText: 'Unable to run Copilot in this environment.',
      });
    });

    child.on('close', (code) => {
      stdoutBuffer = flushLines(stdoutBuffer, 'stdout');
      stderrBuffer = flushLines(stderrBuffer, 'stderr', 'stderr: ');

      if (code === 0) {
        const summary = summarizeCopilotOutput(stdout, stderr);
        resolveOnce({
          ok: true,
          message: 'Copilot applied the requested changes.',
          assistantText: summary,
        });
        return;
      }

      resolveOnce({
        ok: false,
        message: stderr.trim() || `Copilot exited with code ${String(code ?? 'unknown')}.`,
        assistantText: 'Copilot could not complete the request.',
      });
    });
  });
}

function summarizeCopilotOutput(stdout: string, stderr: string): string {
  const combined = `${stdout}\n${stderr}`.trim();
  if (!combined) {
    return 'Copilot applied the requested changes in the workspace.';
  }

  const lines = combined
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(-8);

  return ['Copilot run completed.', ...lines].join('\n');
}

function sanitizeCopilotOutputLine(line: string): string {
  const cleaned = line.trim();
  if (!cleaned) {
    return '';
  }

  if (cleaned === 'null' || cleaned === 'undefined') {
    return '';
  }

  return cleaned;
}

interface DraftChange {
  summary: string;
  file: FileOperation;
}

function createDraftChange(rootRealPath: string, prompt: string): DraftChange {
  const normalizedPrompt = prompt.trim().toLowerCase();

  const backgroundMatch = normalizedPrompt.match(
    /change\s+(?:background|bacground)(?:\s+color)?\s+to\s+(.+)$/i,
  );
  if (backgroundMatch) {
    const requestedColor = sanitizeCssColor(backgroundMatch[1]);
    const appPath = 'src/App.tsx';
    const existingText = readTextOrEmpty(rootRealPath, appPath);
    const nextText = updatePageBackground(existingText, requestedColor);
    const patch = createPatch(appPath, existingText, nextText, 'before', 'after', {
      context: 3,
    });

    return {
      summary: `I updated the page background in ${appPath} to "${requestedColor}" and applied the change locally.`,
      file: {
        type: 'write',
        path: appPath,
        newText: nextText,
        patch,
      },
    };
  }

  const titleMatch = normalizedPrompt.match(/change\s+title\s+to\s+(.+)$/i);
  if (titleMatch) {
    const requestedTitle = sanitizeTitle(titleMatch[1]);
    const appPath = 'src/App.tsx';
    const existingText = readTextOrEmpty(rootRealPath, appPath);
    const nextText = updateAppTitle(existingText, requestedTitle);
    const patch = createPatch(appPath, existingText, nextText, 'before', 'after', {
      context: 3,
    });

    return {
      summary: `I updated the app title in ${appPath} to "${requestedTitle}" and applied the change locally.`,
      file: {
        type: 'write',
        path: appPath,
        newText: nextText,
        patch,
      },
    };
  }

  const timestamp = new Date().toISOString();
  const fallbackPath = 'live-ai-notes.md';
  const fallbackText = buildSuggestedFileContent(prompt, timestamp);
  const existingFallbackText = readTextOrEmpty(rootRealPath, fallbackPath);
  const fallbackPatch = createPatch(
    fallbackPath,
    existingFallbackText,
    fallbackText,
    'before',
    'after',
    {
      context: 3,
    },
  );

  return {
    summary:
      'I prepared and applied a minimal starter change set for the experimental Live-AI flow.',
    file: {
      type: 'write',
      path: fallbackPath,
      newText: fallbackText,
      patch: fallbackPatch,
    },
  };
}

function buildSuggestedFileContent(prompt: string, createdAt: string): string {
  return [
    '# Live AI Proposed Change',
    '',
    `Created: ${createdAt}`,
    '',
    '## Prompt',
    prompt,
    '',
    '## Next',
    '- Replace this placeholder with model-driven file operations.',
    '- Keep manual apply as the default safety mode.',
    '',
  ].join('\n');
}

function sanitizeTitle(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, '');
}

function sanitizeCssColor(value: string): string {
  const sanitized = value
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/;+$/g, '');
  if (!sanitized) {
    throw new Error('Background color value cannot be empty');
  }

  return sanitized;
}

function updateAppTitle(source: string, title: string): string {
  const titlePattern = /(<h1\s+style=\{styles\.title\}>)([^<]+)(<\/h1>)/;
  if (!titlePattern.test(source)) {
    throw new Error('Could not locate the app title in src/App.tsx');
  }

  return source.replace(titlePattern, `$1${title}$3`);
}

function updatePageBackground(source: string, color: string): string {
  const backgroundPattern = /background:\s*(?:'[^']*'|"[^"]*"),/;
  if (!backgroundPattern.test(source)) {
    throw new Error('Could not locate the page background in src/App.tsx');
  }

  return source.replace(backgroundPattern, `background: '${color}',`);
}

function applyFileOperation(rootRealPath: string, operation: FileOperation): void {
  if (operation.type !== 'write') {
    throw new Error(`Unsupported operation type: ${String(operation.type)}`);
  }

  const targetPath = resolveSafeTargetPath(rootRealPath, operation.path);
  mkdirSync(dirname(targetPath), { recursive: true });
  assertWithinRootByRealPath(rootRealPath, targetPath);
  writeFileSync(targetPath, operation.newText, 'utf8');
}

function parseClientRequest(raw: string): ClientRequest {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON request payload');
  }

  if (!isRecord(parsed) || typeof parsed.type !== 'string') {
    throw new Error('Invalid request payload');
  }

  if (parsed.type === 'chat.send') {
    if (typeof parsed.sessionId !== 'string' || typeof parsed.message !== 'string') {
      throw new Error('Invalid chat.send payload');
    }
    const request: ChatSendRequest = {
      type: 'chat.send',
      sessionId: parsed.sessionId,
      message: parsed.message,
      mode: typeof parsed.mode === 'string' ? parsed.mode : undefined,
      agent: typeof parsed.agent === 'string' ? parsed.agent : undefined,
      model: typeof parsed.model === 'string' ? parsed.model : undefined,
    };
    return request;
  }

  if (parsed.type === 'changes.apply' || parsed.type === 'changes.reject') {
    if (typeof parsed.sessionId !== 'string' || typeof parsed.changeSetId !== 'string') {
      throw new Error(`Invalid ${parsed.type} payload`);
    }
    return {
      type: parsed.type,
      sessionId: parsed.sessionId,
      changeSetId: parsed.changeSetId,
    };
  }

  throw new Error(`Unsupported request type: ${parsed.type}`);
}

function resolveConfiguredRoot(explicitRoot: string | undefined): string {
  if (explicitRoot) {
    const resolved = resolve(explicitRoot);
    if (!existsSync(join(resolved, 'package.json'))) {
      throw new Error(`No package.json found at explicit root: ${resolved}`);
    }
    return resolved;
  }

  const inferred = findNearestPackageRoot(process.cwd());
  if (!inferred) {
    throw new Error('Could not locate a package root. Use --root to set one explicitly.');
  }

  return inferred;
}

function findNearestPackageRoot(startDir: string): string | undefined {
  let current = resolve(startDir);

  while (true) {
    if (existsSync(join(current, 'package.json'))) {
      return current;
    }

    const parent = dirname(current);
    if (parent === current) {
      return undefined;
    }
    current = parent;
  }
}

function resolveSafeTargetPath(rootRealPath: string, relativePath: string): string {
  if (!relativePath || relativePath.trim() === '') {
    throw new Error('Operation path must be a non-empty relative path');
  }

  if (isAbsolute(relativePath)) {
    throw new Error('Absolute paths are not allowed');
  }

  const normalized = relativePath.replace(/\\+/g, '/');
  const segments = normalized.split('/');
  if (segments.some((segment) => segment === '..')) {
    throw new Error('Path traversal is not allowed');
  }

  const absoluteTarget = resolve(rootRealPath, normalized);
  const rel = relative(rootRealPath, absoluteTarget);
  if (rel.startsWith('..') || isAbsolute(rel)) {
    throw new Error('Resolved path escapes root directory');
  }

  return absoluteTarget;
}

function assertWithinRootByRealPath(rootRealPath: string, targetPath: string): void {
  const existingPath = findNearestExistingPath(targetPath);
  const existingRealPath = realpathSync(existingPath);
  const rel = relative(rootRealPath, existingRealPath);
  if (rel.startsWith('..') || isAbsolute(rel)) {
    throw new Error('Symlink escape detected for target path');
  }
}

function findNearestExistingPath(targetPath: string): string {
  let current = targetPath;
  while (!existsSync(current)) {
    const parent = dirname(current);
    if (parent === current) {
      return current;
    }
    current = parent;
  }
  return current;
}

function ensureSession(sessions: Map<string, SessionState>, sessionId: string): SessionState {
  const existing = sessions.get(sessionId);
  if (existing) {
    return existing;
  }

  const created: SessionState = {
    changeSets: new Map<string, ChangeSet>(),
  };
  sessions.set(sessionId, created);
  return created;
}

function appendAuditLog(root: string, sessionId: string, entry: Record<string, unknown>): void {
  const sessionsDir = join(root, '.live-ai', 'sessions');
  mkdirSync(sessionsDir, { recursive: true });
  const file = join(sessionsDir, `${sessionId}.jsonl`);
  appendFileSync(file, `${JSON.stringify(entry)}\n`, 'utf8');
}

function readTextOrEmpty(root: string, path: string): string {
  const target = resolveSafeTargetPath(root, path);
  if (!existsSync(target)) {
    return '';
  }

  assertWithinRootByRealPath(root, target);
  return readFileSync(target, 'utf8');
}

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function tokenize(text: string): string[] {
  return text.split(/(\s+)/).filter((part) => part.length > 0);
}

function emit(socket: WebSocket, event: ServerEvent): void {
  socket.send(JSON.stringify(event));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown server error';
}

export type {
  ChangeSet,
  ClientRequest,
  FileOperation,
  LiveAiServer,
  ServerEvent,
  StartServerOptions,
} from './types.js';
export { AVAILABLE_AGENTS, AVAILABLE_MODELS } from './config.js';
export type { AvailableAgent, AvailableModel } from './config.js';
