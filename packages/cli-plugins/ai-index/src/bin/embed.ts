import { globbyStream } from 'globby';
import { relative } from 'node:path';
import multimatch from 'multimatch';
import { concat, from, merge } from 'rxjs';
import { concatMap, filter, map, mergeMap, shareReplay, toArray } from 'rxjs/operators';

import { isMarkdownFile, parseMarkdownFile } from '../utils/markdown/index.js';
import { getFileStatus, resolveProjectRoot } from '../utils/git/index.js';
import { isTypescriptFile, parseTsDocFromFileSync } from '../utils/ts-doc/index.js';

import { getDiff } from './get-diff.js';
import { createDeleteRemovedFilesStream } from './delete-removed-files.js';
import { applyMetadata } from './apply-metadata.js';
import type {
  DocumentEntry,
  EmbeddingsBinOptions,
  ProcessedFile,
  UpdateVectorStoreResult,
} from './types.js';
import type { VectorStoreDocument } from '@equinor/fusion-framework-module-ai/lib';
import { readFileSync } from 'node:fs';
import { generateChunkId } from '../utils/generate-chunk-id.js';

/**
 * Default directories to skip before expensive git operations.
 * These are common build artifacts and dependencies that should be ignored.
 * @internal
 */
const defaultIgnore = ['node_modules', '**/node_modules/**', 'dist', '**/dist/**', '.git'];

/**
 * Main entry point for the embeddings bin.
 * Orchestrates the entire embeddings generation pipeline.
 * @internal
 */
export async function embed(binOptions: EmbeddingsBinOptions): Promise<void> {
  const { framework, options, config, filePatterns } = binOptions;

  // Handle clean operation (destructive - deletes all existing documents)
  const vectorStoreService = framework.ai.getService('search', options.azureSearchIndexName);
  if (options.clean && !options.dryRun) {
    console.log('🧹 Cleaning vector store: deleting all existing documents...');
    // OData filter: delete all documents with non-empty source (all indexed docs)
    await vectorStoreService.deleteDocuments({
      filter: { filterExpression: "metadata/source ne ''" },
    });
    console.log('✅ Vector store cleaned successfully');
  }

  // Handle diff-based processing (workflow mode)
  const changedFiles = options.diff ? await getDiff(options) : [];

  // Create file stream: diff mode uses git changes, normal mode uses globby
  const files$ = (() => {
    if (options.diff) {
      return from(changedFiles);
    }

    // Directories to skip before expensive git operations.
    // Note: Even with gitignore: true, globby still traverses ignored directories when .gitignore
    // contains negation patterns (like !.yarn/releases), so we add explicit ignore patterns
    // to prevent traversing these directories entirely.
    const ignore = config.index?.ignore ?? defaultIgnore;

    return from(
      globbyStream(filePatterns, {
        ignore,
        onlyFiles: true,
        gitignore: true,
        absolute: true,
      }),
    ).pipe(
      // Get git status concurrently, then flatten array results
      mergeMap((path) => getFileStatus(path)),
      concatMap((files) => from(files)),
      // Share stream for multiple subscribers (removedFiles$ and indexFiles$)
      shareReplay({ refCount: true }),
    );
  })();

  // Process files: enrich with metadata and filter by allowed patterns
  const allowedFilePatterns = config.index?.patterns ?? [
    '**/*.ts',
    '**/*.tsx',
    '**/*.md',
    '**/*.mdx',
  ];

  // Process files: enrich with metadata and filter by allowed patterns
  const processedFiles$ = files$.pipe(
    map((file) => {
      const { filepath, status } = file;
      const projectRoot = resolveProjectRoot(filepath);
      const relativePath = projectRoot ? relative(projectRoot, filepath) : filepath;

      return {
        path: filepath,
        status,
        projectRoot,
        relativePath,
      };
    }),
    filter((file) => {
      const matches = multimatch(file.relativePath, allowedFilePatterns);
      return matches.length > 0;
    }),
    // Share for multiple subscribers (removedFiles$, markdown$, typescript$)
    shareReplay({ refCount: true }),
  );

  // Split stream: removed files for deletion, new/modified for indexing
  const removedFiles$ = processedFiles$.pipe(filter((file) => file.status === 'removed'));

  // Create processing streams
  const delete$ = createDeleteRemovedFilesStream(removedFiles$, framework, options);

  // New/modified files for indexing
  const indexFiles$ = processedFiles$.pipe(
    filter((file) => file.status === 'new' || file.status === 'modified'),
    // Share for markdown$ and typescript$ pipelines
    shareReplay({ refCount: true }),
  );

  const isRawFile = (file: ProcessedFile): boolean => {
    const matches = multimatch(file.relativePath, config.index?.rawPatterns ?? []);
    if (matches.length > 0) {
      return true;
    }
    return false;
  };

  const rawFiles$ = indexFiles$.pipe(
    filter(isRawFile),
    map((file): DocumentEntry => {
      const document: VectorStoreDocument = {
        id: generateChunkId(file.relativePath),
        pageContent: readFileSync(file.path, 'utf8'),
        metadata: {
          source: file.relativePath,
          type: 'raw',
        },
      };
      return { status: file.status, documents: [document] };
    }),
  );

  const markdown$ = indexFiles$.pipe(
    filter((x) => !isRawFile(x)),
    filter((file) => isMarkdownFile(file.path)),
    mergeMap(async (file) => {
      const documents = await parseMarkdownFile(file);
      return { status: file.status, documents };
    }),
  );

  const typescript$ = indexFiles$.pipe(
    filter((x) => !isRawFile(x)),
    filter((file) => isTypescriptFile(file.path)),
    map((file) => {
      const documents = parseTsDocFromFileSync(file);
      return { status: file.status, documents };
    }),
  );

  // Apply metadata to documents
  const applyMetadata$ = applyMetadata(merge(rawFiles$, markdown$, typescript$), config.index);

  // Generate embeddings
  const embeddingService = framework.ai.getService('embeddings', options.openaiEmbeddingDeployment);
  const applyEmbedding$ = applyMetadata$.pipe(
    mergeMap((documents) =>
      from(documents).pipe(
        mergeMap(async (document) => {
          console.log('embedding document', document.metadata.source);
          const embeddings = await embeddingService
            .embedQuery(document.pageContent)
            .catch((error) => {
              console.error(
                `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              );
              console.error('document', document);
              process.exit(1);
            });
          const metadata = { ...document.metadata, embedding: embeddings };
          return { ...document, metadata };
        }),
        toArray(),
      ),
    ),
  );

  // Update vector store
  const upsert$ = applyEmbedding$.pipe(
    mergeMap(async (documents) => {
      const vectorStoreService = framework.ai.getService('search', options.azureSearchIndexName);
      if (documents.length === 0) {
        return undefined;
      }
      for (const document of documents) {
        console.log(`Adding entry [${document.id}] to vector store`, document.metadata.source);
      }
      if (!options.dryRun) {
        // For multiple chunks from same file, delete existing chunks first
        if (documents.length > 1) {
          const sources = documents
            .map((document) => document.metadata.source)
            .reduce((acc, source) => acc.add(source), new Set<string>());

          const filterExpression = Array.from(sources)
            .map((source) => `metadata/source eq '${source}'`)
            .join(' or ');

          // Fire-and-forget deletion (not awaited) - brief gap before new docs are indexed
          vectorStoreService.deleteDocuments({ filter: { filterExpression } });
        }
        await vectorStoreService.addDocuments(documents);
      }
      return {
        status: 'added',
        documents,
      } as UpdateVectorStoreResult;
    }),
    filter((result): result is UpdateVectorStoreResult => Boolean(result)),
  );

  // Execute pipeline
  // Track indexing results for reporting: deleted file paths and added document IDs
  const indexingResults: { deleted: string[]; added: { source: string; id: string }[] } = {
    deleted: [],
    added: [],
  };

  // Execute pipeline: concat ensures deletions happen before additions
  // This subscription triggers lazy RxJS execution and tracks all results
  concat(delete$, upsert$).subscribe({
    next: (result) => {
      // Track deleted files by relative path
      if (result.status === 'deleted') {
        indexingResults.deleted.push(...result.files.map((file) => file.relativePath));
      }
      // Track added documents with source and ID (one file can produce multiple IDs)
      else if (result.status === 'added') {
        indexingResults.added.push(
          ...result.documents.map((document) => ({
            source: document.metadata.source,
            id: document.id,
          })),
        );
      }
    },
    error: (error) => {
      console.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    },
    complete: () => {
      // Pipeline completed - log results and exit
      console.log('🗂️ Indexing results:', indexingResults);
      console.log('✅ Embeddings generation completed!');
      process.exit(0);
    },
  });
}
