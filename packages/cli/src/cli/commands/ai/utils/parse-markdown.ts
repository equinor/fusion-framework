import { readFileSync } from 'node:fs';
import { assert } from 'node:console';

import { default as grayMatter } from 'gray-matter';

import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

import type {
  VectorStoreDocument,
  VectorStoreDocumentMetadata,
} from '@equinor/fusion-framework-module-ai/lib';
import type { SourceFile } from './types.js';
import { generateChunkId } from './generate-cunk-id.js';

export type MarkdownMetadata<T extends Record<string, unknown> = Record<string, unknown>> =
  VectorStoreDocumentMetadata<
    T & {
      type: 'markdown';
    }
  >;

export type MarkdownDocument<T extends Record<string, unknown> = Record<string, unknown>> =
  VectorStoreDocument<MarkdownMetadata<T>>;

const markdownConfig = {
  chunkSize: 2000,
  chunkOverlap: 200,
  separators: ['\n# ', '\n## ', '\n```'],
};

export const isMarkdownFile = (filePath: string): boolean => {
  return filePath.endsWith('.md');
};

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
    (chunk, index): MarkdownDocument<T> => ({
      id: generateChunkId(source, index),
      pageContent: chunk,
      metadata: {
        source,
        attributes: markdownAttributes as MarkdownMetadata<T>['attributes'],
      },
    }),
  );
};

export const parseMarkdownFile = async <
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  file: SourceFile,
): Promise<MarkdownDocument<T>[]> => {
  assert(isMarkdownFile(file.path), `File ${file.path} is not a markdown file`);
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
