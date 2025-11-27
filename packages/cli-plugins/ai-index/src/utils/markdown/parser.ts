import { readFileSync } from 'node:fs';
import { assert } from 'node:console';

import { default as grayMatter } from 'gray-matter';

import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

import type { SourceFile } from '../types.js';
import type { MarkdownDocument, MarkdownMetadata } from './types.js';
import { generateChunkId } from '../generate-chunk-id.js';

const markdownConfig = {
  chunkSize: 3000,
  chunkOverlap: 300,
  keepSeparator: true,
  separators: [
    '\n# ',
    '\n## ',
    '\n### ',
    '\n#### ',
    '\n##### ',
    '\n###### ',
    '\n```',
    '\n---\n',
    '\n\n',
  ],
};

/**
 * Check if a file is a markdown or MDX file
 * @param filePath - File path to check
 * @returns True if file has .md or .mdx extension
 */
export const isMarkdownFile = (filePath: string): boolean => {
  return filePath.endsWith('.md') || filePath.endsWith('.mdx');
};

/**
 * Parse markdown or MDX content into document chunks
 * @param content - Markdown or MDX content string
 * @param source - Source file path
 * @returns Array of markdown documents
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
  return chunks.map(
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
 * Parse a markdown or MDX file into document chunks
 * @param file - Source file object
 * @returns Array of markdown documents with root path metadata
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
