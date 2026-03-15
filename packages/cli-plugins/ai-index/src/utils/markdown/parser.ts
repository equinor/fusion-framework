import { readFileSync } from 'node:fs';
import { assert } from 'node:console';

import { default as grayMatter } from 'gray-matter';

import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

import type { SourceFile } from '../types.js';
import type { MarkdownDocument, MarkdownMetadata } from './types.js';
import { generateChunkId } from '../generate-chunk-id.js';

const markdownConfig = {
  chunkSize: 2000,
  chunkOverlap: 300,
  separators: [
    '\n# ',
    '\n## ',
    '\n### ',
    '\n#### ',
    '\n##### ',
    '\n###### ',
    '\n```',
    '\n```\n',
    '\n---\n',
    '\n\n',
    '\n',
  ],
  keepSeparator: true,
};

/**
 * Checks whether a file path has a Markdown (`.md`) or MDX (`.mdx`) extension.
 *
 * @param filePath - Absolute or relative file path.
 * @returns `true` when the extension is `.md` or `.mdx`.
 */
export const isMarkdownFile = (filePath: string): boolean => {
  return filePath.endsWith('.md') || filePath.endsWith('.mdx');
};

/**
 * Validates that a text chunk contains meaningful content.
 *
 * Filters out empty strings and chunks consisting solely of code-fence
 * markers (e.g. ` ``` ` or ` ```ts `).
 *
 * @param chunk - Content chunk to validate.
 * @returns `true` if the chunk has substantive content.
 */
const isValidChunk = (chunk: string): boolean => {
  const trimmed = chunk.trim();
  if (!trimmed) return false;
  // Skip chunks that are only code fence markers
  if (/^`{3,}[\w-]*$/.test(trimmed)) return false;
  return true;
};

/**
 * Parses Markdown or MDX content into chunked vector-store documents.
 *
 * Extracts YAML frontmatter via `gray-matter`, splits the body using
 * {@link RecursiveCharacterTextSplitter}, and returns one
 * {@link MarkdownDocument} per valid chunk.
 *
 * @template T - Additional frontmatter attributes.
 * @param content - Raw Markdown / MDX string.
 * @param source - Relative source file path used as the document key.
 * @returns Array of chunked Markdown documents.
 */
export const parseMarkdown = async <T extends Record<string, unknown> = Record<string, unknown>>(
  content: string,
  source: string,
): Promise<MarkdownDocument<T>[]> => {
  const { content: markdownContent, data } = grayMatter(content);
  const markdownAttributes = Object.entries(data).reduce(
    (acc, [key, value]) => {
      acc[`md_${key}`] = value;
      return acc;
    },
    {
      type: 'markdown',
    } as Record<string, unknown>,
  );
  const textSplitter = new RecursiveCharacterTextSplitter(markdownConfig);
  const chunks = await textSplitter.splitText(markdownContent);

  // Filter out empty chunks and chunks that are just code fence markers
  const validChunks = chunks.filter((chunk) => {
    if (!isValidChunk(chunk)) {
      return false;
    }
    return true;
  });

  return validChunks.map(
    (chunk, _index): MarkdownDocument<T> => ({
      id: generateChunkId(source, _index),
      pageContent: chunk,
      metadata: {
        source,
        attributes: markdownAttributes as MarkdownMetadata<T>['attributes'],
      },
    }),
  );
};

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
  return result.map((document) => ({
    ...document,
    metadata: {
      ...document.metadata,
      rootPath: file.projectRoot,
    },
  }));
};
