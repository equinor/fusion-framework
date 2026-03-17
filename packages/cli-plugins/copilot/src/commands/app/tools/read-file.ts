import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, isAbsolute, join } from 'node:path';

import type { ToolResultObject } from '@github/copilot-sdk';

import type { DefineTool } from './types.js';

/** Image extensions that should be returned as vision-capable binary results. */
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);

/** MIME types for supported image formats. */
const IMAGE_MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

/**
 * Resolves a path within a base directory, rejecting escapes.
 *
 * @param baseDir - The allowed root directory
 * @param input - The user-provided path (relative or absolute within baseDir)
 * @returns The resolved absolute path
 * @throws {Error} When the path escapes the base directory
 */
function resolveSafe(baseDir: string, input: string): string {
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
 * Creates the read-file tool so the judge agent can inspect evidence artifacts.
 *
 * For image files the tool returns a `ToolBinaryResult` with base64-encoded
 * data that multimodal models can view directly. Text files are returned
 * as plain text. Directories return a listing of their contents.
 *
 * @param baseDir - The run output directory that scopes all reads
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Copilot tool definition for reading evidence files
 */
export function createReadFileTool(baseDir: string, defineTool: DefineTool) {
  return defineTool('read_file', {
    description:
      'Read a file or list a directory from the output directory. ' +
      'Image files (png, jpg, jpeg, gif, webp) are returned as inline images the model can see. ' +
      'Text files are returned as plain text. Directories return a file listing.',
    parameters: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description:
            'File or directory path relative to the output directory (e.g. "evidence/step-hello.png" or "executions.jsonl")',
        },
      },
      required: ['path'],
    },
    handler: async (args): Promise<string | ToolResultObject> => {
      const { path } = args as { path: string };
      const resolved = resolveSafe(baseDir, path);

      if (!existsSync(resolved)) {
        return `File not found: ${path}`;
      }

      const stat = statSync(resolved);

      // ── Directory listing ──
      if (stat.isDirectory()) {
        const entries = readdirSync(resolved).sort();
        return entries.length > 0
          ? `Directory ${path}/:\n${entries.join('\n')}`
          : `Directory ${path}/ is empty`;
      }

      const ext = extname(resolved).toLowerCase();

      // ── Image: return as binary vision result ──
      if (IMAGE_EXTENSIONS.has(ext)) {
        const mime = IMAGE_MIME[ext] ?? 'application/octet-stream';
        return {
          textResultForLlm: `Image file: ${path} (${mime}, ${stat.size} bytes). Inspect the attached image.`,
          binaryResultsForLlm: [
            {
              data: readFileSync(resolved, 'base64'),
              mimeType: mime,
              type: 'image',
              description: `Evidence artifact: ${basename(resolved)}`,
            },
          ],
          resultType: 'success',
          toolTelemetry: {},
        };
      }

      // ── Text file ──
      return readFileSync(resolved, 'utf-8');
    },
  });
}
