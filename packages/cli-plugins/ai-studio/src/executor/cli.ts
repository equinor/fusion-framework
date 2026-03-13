import { spawn } from 'node:child_process';
import {
  parseOperationLine,
  sanitizeCopilotOutputLine,
  streamAssistantText,
} from '../copilot-stream.js';
import type {
  ChatExecutionCallbacks,
  ChatExecutionOptions,
  ChatExecutionResult,
  ChatExecutor,
} from './types.js';

/**
 * Creates the Copilot CLI-backed executor.
 * @returns Executor that streams output from the local Copilot CLI process.
 */
export function createCliChatExecutor(): ChatExecutor {
  return {
    mode: 'cli',
    execute: (prompt, cwd, options, callbacks) => runCopilotApply(prompt, cwd, options, callbacks),
  };
}

async function runCopilotApply(
  prompt: string,
  cwd: string,
  options: ChatExecutionOptions,
  callbacks: ChatExecutionCallbacks,
): Promise<ChatExecutionResult> {
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

    const resolveOnce = (result: ChatExecutionResult) => {
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

        const operationCandidate =
          sink === 'stderr' ? sanitized.replace(/^stderr:\s*/i, '') : sanitized;
        const operationLine = parseOperationLine(operationCandidate);
        if (operationLine) {
          callbacks.onOperation(operationLine);
          continue;
        }

        if (sink === 'stdout') {
          stdout += `${sanitized}\n`;
          streamAssistantText(`${sanitized}\n`, callbacks.onAssistantChunk);
        } else {
          stderr += `${sanitized}\n`;
        }

        callbacks.onProgress(messagePrefix ? `${messagePrefix}${sanitized}` : sanitized);
      }
      return remainder;
    };

    const flushRemainder = (buffer: string, sink: 'stdout' | 'stderr'): void => {
      const sanitized = sanitizeCopilotOutputLine(buffer);
      if (!sanitized) {
        return;
      }

      const operationCandidate =
        sink === 'stderr' ? sanitized.replace(/^stderr:\s*/i, '') : sanitized;
      const operationLine = parseOperationLine(operationCandidate);
      if (operationLine) {
        callbacks.onOperation(operationLine);
        return;
      }

      if (sink === 'stdout') {
        stdout += `${sanitized}\n`;
        streamAssistantText(`${sanitized}\n`, callbacks.onAssistantChunk);
      } else {
        stderr += `${sanitized}\n`;
      }

      callbacks.onProgress(sink === 'stderr' ? `stderr: ${sanitized}` : sanitized);
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
      flushRemainder(stdoutBuffer, 'stdout');
      flushRemainder(stderrBuffer, 'stderr');

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
  const merged = `${stdout}\n${stderr}`;
  const lines = merged
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);

  return lines.join('\n');
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown server error';
}
