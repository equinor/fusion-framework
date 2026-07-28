import { readFileSync } from 'node:fs';
import { assert } from 'node:console';

import type { SourceFile } from '../types.js';
import type { MarkdownDocument } from './types.js';
import { isMarkdownFile } from './is-markdown-file.js';
import { parseMarkdown } from './parse-markdown.js';

/**
 * Reads a Markdown or MDX file from disk and parses it into chunked documents.
 *
 * Delegates to {@link parseMarkdown} after reading the file content, then
 * enriches each resulting document with the `rootPath` from the source file.
 *
 * @template T - Additional frontmatter attributes.
 * @param file - Source file descriptor with path and optional project root.
 * @returns Array of Markdown documents with root-path metadata.
 * @throws {AssertionError} If the file does not have a `.md` or `.mdx` extension.
 */
export const parseMarkdownFile = async <
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  file: SourceFile,
): Promise<MarkdownDocument<T>[]> => {
  assert(isMarkdownFile(file.path), `File ${file.path} is not a markdown or MDX file`);
  const content = readFileSync(file.path, 'utf8');
  const result = await parseMarkdown<T>(content, file.relativePath ?? file.path);
  // Enrich each parsed chunk with the file's project root for downstream path resolution
  return result.map((document) => ({
    ...document,
    metadata: {
      ...document.metadata,
      rootPath: file.projectRoot,
    },
  }));
};
