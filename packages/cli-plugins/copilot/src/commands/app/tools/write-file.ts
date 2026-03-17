import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';

import type { DefineTool } from './types.js';

/**
 * Resolves a path within a base directory, rejecting escapes.
 *
 * Accepts both relative paths and absolute paths that fall within
 * the base directory. Strips the base prefix from absolute paths
 * before resolving to handle models that echo full paths from prompts.
 *
 * @param baseDir - The allowed root directory
 * @param input - The user-provided path (relative or absolute within baseDir)
 * @returns The resolved absolute path
 * @throws {Error} When the path escapes the base directory
 */
function resolveSafe(baseDir: string, input: string): string {
  // If the model echoed the full absolute path from the prompt, strip the base prefix.
  const relative = isAbsolute(input)
    ? input.startsWith(baseDir + '/') || input.startsWith(baseDir + '\\')
      ? input.slice(baseDir.length + 1)
      : (() => { throw new Error(`Absolute path outside output directory: ${input}`); })()
    : input;
  const resolved = join(baseDir, relative);
  if (!resolved.startsWith(baseDir)) {
    throw new Error(`Path escapes the output directory: ${input}`);
  }
  return resolved;
}

/**
 * Creates the write-file tool so the agent can save artifacts
 * (plan.json, verdict.json, etc.) to the run output directory.
 *
 * @param baseDir - The run output directory that scopes all writes
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Copilot tool definition for writing a file
 */
export function createWriteFileTool(baseDir: string, defineTool: DefineTool) {
  return defineTool('write_file', {
    description:
      'Write content to a file in the output directory. Creates parent directories as needed.',
    parameters: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: 'File path relative to the output directory (e.g. "plan.json")',
        },
        content: {
          type: 'string',
          description: 'The full file content to write',
        },
      },
      required: ['path', 'content'],
    },
    handler: async (args) => {
      const { path, content } = args as { path: string; content: string };
      const resolved = resolveSafe(baseDir, path);
      mkdirSync(dirname(resolved), { recursive: true });
      writeFileSync(resolved, content);
      return `Wrote ${content.length} bytes to ${path}`;
    },
  });
}

/**
 * Creates the append-file tool so the agent can append lines
 * to artifacts like executions.jsonl.
 *
 * @param baseDir - The run output directory that scopes all writes
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Copilot tool definition for appending to a file
 */
export function createAppendFileTool(baseDir: string, defineTool: DefineTool) {
  return defineTool('append_file', {
    description:
      'Append content to a file in the output directory. Creates the file if it does not exist.',
    parameters: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: 'File path relative to the output directory (e.g. "executions.jsonl")',
        },
        content: {
          type: 'string',
          description: 'Content to append (a trailing newline is added automatically)',
        },
      },
      required: ['path', 'content'],
    },
    handler: async (args) => {
      const { path, content } = args as { path: string; content: string };
      const resolved = resolveSafe(baseDir, path);
      mkdirSync(dirname(resolved), { recursive: true });
      appendFileSync(resolved, content.endsWith('\n') ? content : content + '\n');
      return `Appended to ${path}`;
    },
  });
}
