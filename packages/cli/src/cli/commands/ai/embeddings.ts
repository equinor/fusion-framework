import path, { relative } from 'node:path';

import { globbyStream } from 'globby';
import multimatch from 'multimatch';
import {
  from,
  filter,
  map,
  shareReplay,
  merge,
  toArray,
  concatMap,
  mergeMap,
  tap,
  concat,
} from 'rxjs';
import type { Observable } from 'rxjs';
import { createCommand, createOption } from 'commander';

import { importConfig } from '@equinor/fusion-imports';
import type { VectorStoreDocument } from '@equinor/fusion-framework-module-ai/lib';

import { type AiOptions, withAiOptions } from '../../options/ai.js';

import { setupFramework } from './utils/setup-framework.js';
import { isMarkdownFile, parseMarkdownFile } from './utils/markdown/index.js';
import { isTypescriptFile, parseTsDocFromFileSync } from './utils/ts-doc/index.js';
import {
  extractGitMetadata,
  resolveProjectRoot,
  getChangedFiles,
  getGitStatus,
  getFileStatus,
  type ChangedFile,
} from './utils/git/index.js';

import type { FusionAIConfig } from '../../../lib/ai/fusion-ai.js';

type UpdateVectorStoreResult = { status: 'added'; documents: VectorStoreDocument[] };
type DeleteRemovedFilesResult = { status: 'deleted'; files: { relativePath: string }[] };

/**
 * CLI command: `ai embeddings`
 *
 * Document embedding utilities for Large Language Model processing.
 *
 * Features:
 * - Markdown document chunking with frontmatter extraction
 * - TypeScript/TSX TSDoc extraction and chunking
 * - Glob pattern support for file collection
 * - Git diff-based processing for workflow integration
 * - Dry-run mode for testing without actual processing
 * - Configurable file patterns via fusion-ai.config.ts
 *
 * Usage:
 *   $ ffc ai embeddings [options] [glob-patterns...]
 *
 * Arguments:
 *   glob-patterns          Glob patterns to match files (optional when using --diff)
 *                          Defaults to patterns from fusion-ai.config.ts if not provided
 *
 * Options:
 *   --dry-run              Show what would be processed without actually doing it
 *   --config <config>      Path to a config file (default: fusion-ai.config.ts)
 *   --diff                 Process only changed files (workflow mode)
 *   --base-ref <ref>       Git reference to compare against (default: HEAD~1)
 *   --clean                Delete all existing documents from the vector store before processing
 *
 * AI Options (required):
 *   --openai-api-key <key>              Azure OpenAI API key (or AZURE_OPENAI_API_KEY env var)
 *   --openai-api-version <version>      Azure OpenAI API version (default: 2024-02-15-preview)
 *   --openai-instance <name>            Azure OpenAI instance name (or AZURE_OPENAI_INSTANCE_NAME env var)
 *   --openai-embedding-deployment <name> Azure OpenAI embedding deployment name (or AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME env var)
 *   --azure-search-endpoint <url>       Azure Search endpoint URL (or AZURE_SEARCH_ENDPOINT env var)
 *   --azure-search-api-key <key>        Azure Search API key (or AZURE_SEARCH_API_KEY env var)
 *   --azure-search-index-name <name>    Azure Search index name (or AZURE_SEARCH_INDEX_NAME env var)
 *
 * Examples:
 *   $ ffc ai embeddings --dry-run ./src
 *   $ ffc ai embeddings "*.ts" "*.md"
 *   $ ffc ai embeddings --diff
 *   $ ffc ai embeddings --diff --base-ref origin/main
 *   $ ffc ai embeddings --clean "*.ts"
 */
/**
 * Command options for the embeddings command.
 * Extends AiOptions with embeddings-specific options.
 */
type CommandOptions = AiOptions & {
  /** Show what would be processed without actually doing it */
  dryRun: boolean;
  /** Path to a config file */
  config: string;
  /** Process only changed files (workflow mode) */
  diff: boolean;
  /** Git reference to compare against */
  baseRef?: string;
  /** Delete all existing documents from the vector store before processing */
  clean: boolean;
};

const _command = createCommand('embeddings')
  .description('Document embedding utilities for Large Language Model processing')
  .addOption(
    createOption('--dry-run', 'Show what would be processed without actually doing it').default(
      false,
    ),
  )
  .addOption(
    createOption('--config <config>', 'Path to a config file').default('fusion-ai.config.ts'),
  )
  .addOption(createOption('--diff', 'Process only changed files (workflow mode)').default(false))
  .addOption(createOption('--base-ref <ref>', 'Git reference to compare against').default('HEAD~1'))
  .addOption(
    createOption(
      '--clean',
      'Delete all existing documents from the vector store before processing',
    ).default(false),
  )
  .argument('[glob-patterns...]', 'Glob patterns to match files (optional when using --diff)')
  .action(async (patterns: string[], options: CommandOptions) => {
    // Load configuration - config file exports a function for dynamic configuration
    const config = await importConfig<() => FusionAIConfig>(options.config, {
      baseDir: process.cwd(),
    }).then((config) => config.config());

    // CLI args take precedence over config patterns
    const allowedFilePatterns = config.patterns ?? ['**/*.ts', '**/*.md'];
    const filePatterns = patterns.length ? patterns : allowedFilePatterns;

    // Initialize framework and get embedding service
    const framework = await setupFramework(options);
    const embeddingService = framework.ai.getService(
      'embeddings',
      options.openaiEmbeddingDeployment!,
    );

    // WARNING: Destructive operation - deletes all existing documents
    if (options.clean) {
      const vectorStoreService = framework.ai.getService('search', options.azureSearchIndexName!);
      if (!options.dryRun) {
        console.log('🧹 Cleaning vector store: deleting all existing documents...');
        // OData filter: delete all documents with non-empty source (all indexed docs)
        await vectorStoreService.deleteDocuments({
          filter: { filterExpression: "metadata/source ne ''" },
        });
        console.log('✅ Vector store cleaned successfully');
      }
    }

    // Handle diff-based processing (workflow mode)
    // This mode processes only files that have changed, useful for CI/CD pipelines
    let changedFiles: ChangedFile[] = [];
    if (options.diff) {
      try {
        // Get current git status for informational output
        const gitStatus = await getGitStatus();
        console.log(`🔍 Git status: ${gitStatus.branch}@${gitStatus.commit}`);
        console.log(
          `📊 Changes: ${gitStatus.stagedFiles} staged, ${gitStatus.unstagedFiles} unstaged`,
        );

        // Get changed files compared to base reference (default: HEAD~1)
        changedFiles = await getChangedFiles({
          diff: options.diff,
          baseRef: options.baseRef,
        });

        if (changedFiles.length === 0) {
          console.log('✅ No changed files match the provided patterns. Nothing to process.');
          process.exit(0);
        }

        console.log(`📝 Found ${changedFiles.length} changed files matching patterns`);
      } catch (error) {
        console.error(
          `❌ Git diff error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        process.exit(1);
      }
    }

    // Create file stream: diff mode uses git changes, normal mode uses globby
    const files$ = options.diff
      ? from(changedFiles)
      : from(
          globbyStream(filePatterns, {
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

    // Enrich files with project root/relative path, filter by config patterns
    // Note: Filter here because diff mode returns all changed files, and config patterns may differ
    const processedFiles$ = files$.pipe(
      map((file) => {
        const { filepath, status } = file;
        const projectRoot = resolveProjectRoot(filepath);
        return {
          path: filepath,
          status,
          projectRoot,
          relativePath: projectRoot ? relative(projectRoot, filepath) : filepath,
        };
      }),
      filter((file) => {
        const matches = multimatch(file.relativePath, allowedFilePatterns);
        return matches.length > 0;
      }),
      tap((file) => console.log('🔍 processing file', file.relativePath)),
      // Share for multiple subscribers (removedFiles$, markdown$, typescript$)
      shareReplay({ refCount: true }),
    );

    // Split stream: removed files for deletion, new/modified for indexing
    const removedFiles$ = processedFiles$.pipe(filter((file) => file.status === 'removed'));
    const indexFiles$ = processedFiles$.pipe(
      filter((file) => file.status === 'new' || file.status === 'modified'),
      // Share for markdown$ and typescript$ pipelines
      shareReplay({ refCount: true }),
    );

    // Batch delete all removed files in a single operation (more efficient than one-by-one)
    const deleteRemovedFiles$: Observable<DeleteRemovedFilesResult> = removedFiles$.pipe(
      toArray(),
      map((files) => {
        if (files.length === 0) {
          return { files: [], filterExpression: null };
        }
        // Build OData filter: "metadata/source eq 'path1' or metadata/source eq 'path2'"
        const filterExpression = files
          .map((file) => `metadata/source eq '${file.relativePath}'`)
          .join(' or ');
        return { files, filterExpression };
      }),
      mergeMap(async ({ files, filterExpression }) => {
        if (files.length === 0) {
          return undefined;
        }
        for (const file of files) {
          console.log('Removing entry from vector store', file.relativePath);
        }
        if (!options.dryRun) {
          const vectorStoreService = framework.ai.getService(
            'search',
            options.azureSearchIndexName!,
          );
          // Single batch deletion - one file can produce multiple document chunks
          await vectorStoreService.deleteDocuments({
            filter: { filterExpression: filterExpression! },
          });
        }
        return {
          status: 'deleted',
          files: files as { relativePath: string }[],
        };
      }),
      filter((result): result is DeleteRemovedFilesResult => Boolean(result)),
    );

    // Process markdown files concurrently (async I/O) - each file produces multiple chunks
    const markdown$ = indexFiles$.pipe(
      filter((file) => isMarkdownFile(file.path)),
      mergeMap(async (file) => {
        const documents = await parseMarkdownFile(file);
        return { status: file.status, documents };
      }),
    );

    // Process TypeScript files synchronously (CPU-bound AST parsing)
    const typescript$ = indexFiles$.pipe(
      filter((file) => isTypescriptFile(file.path)),
      map((file) => {
        const documents = parseTsDocFromFileSync(file);
        return { status: file.status, documents };
      }),
    );

    // Merge streams and enrich with git metadata + custom attribute processor
    const applyMetadata$ = merge(markdown$, typescript$).pipe(
      mergeMap((entry) => {
        return from(entry.documents).pipe(
          // Extract git metadata concurrently for all documents
          mergeMap(async (document): Promise<VectorStoreDocument> => {
            const gitMetadata = document.metadata.source
              ? await extractGitMetadata(
                  path.join(document.metadata.rootPath ?? process.cwd(), document.metadata.source),
                )
              : {};
            return {
              ...document,
              metadata: {
                ...document.metadata,
                attributes: {
                  ...document.metadata.attributes,
                  ...gitMetadata,
                },
              },
            };
          }),
          // Apply custom attribute processor from config
          map((document) => {
            const attributeProcessor =
              config.metadata?.attributeProcessor || ((attributes, _document) => attributes);
            const attributes = attributeProcessor(document.metadata.attributes ?? {}, document);
            return {
              ...document,
              metadata: {
                ...document.metadata,
                attributes,
              },
            };
          }),
          // Group back by file for batch deletion in next step
          toArray(),
        );
      }),
    );

    // Generate embeddings concurrently (most expensive operation - API calls)
    const applyEmbedding$: Observable<VectorStoreDocument[]> = applyMetadata$.pipe(
      mergeMap((documents) =>
        from(documents).pipe(
          mergeMap(async (document) => {
            console.log('embedding document', document.metadata.source);
            const embeddings = await embeddingService.embedQuery(document.pageContent);
            const metadata = { ...document.metadata, embedding: embeddings };
            return { ...document, metadata };
          }),
          toArray(),
        ),
      ),
    );

    // Update vector store: delete old chunks, then add new documents
    // NOTE: Creates brief gap where documents are missing (acceptable for batch updates)
    const updateVectorStore$: Observable<UpdateVectorStoreResult> = applyEmbedding$.pipe(
      mergeMap(async (documents) => {
        const vectorStoreService = framework.ai.getService('search', options.azureSearchIndexName!);
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
        };
      }),
      filter((result): result is UpdateVectorStoreResult => Boolean(result)),
    );

    // Track indexing results for reporting: deleted file paths and added document IDs
    const indexingResults: { deleted: string[]; added: { source: string; id: string }[] } = {
      deleted: [],
      added: [],
    };

    // Execute pipeline: concat ensures deletions happen before additions
    // This subscription triggers lazy RxJS execution and tracks all results
    concat(deleteRemovedFiles$, updateVectorStore$).subscribe({
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
  });

export const command = withAiOptions(_command, {
  includeEmbedding: true,
  includeSearch: true,
});

export default command;
