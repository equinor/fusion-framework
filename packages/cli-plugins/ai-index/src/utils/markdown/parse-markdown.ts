import { default as grayMatter } from 'gray-matter';

import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

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
  // Skip empty or whitespace-only chunks
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
  // Prefix each frontmatter key with `md_` to namespace it in the document metadata
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
    // Discard invalid chunks; keep everything else
    if (!isValidChunk(chunk)) {
      return false;
    }
    return true;
  });

  return (
    validChunks
      // Wrap each valid chunk into a vector-store-ready document
      .map(
        (chunk, _index): MarkdownDocument<T> => ({
          id: generateChunkId(source, _index),
          pageContent: chunk,
          metadata: {
            source,
            attributes: markdownAttributes as MarkdownMetadata<T>['attributes'],
          },
        }),
      )
  );
};
