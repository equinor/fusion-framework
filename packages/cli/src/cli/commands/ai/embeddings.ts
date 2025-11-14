import path, { relative } from 'node:path';

import { globbyStream } from 'globby';
import multimatch from 'multimatch';
import { from, filter, map, shareReplay, merge, toArray, concatMap, mergeMap, tap } from 'rxjs';
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

/**
 * CLI command: `ai embeddings`
 *
 * Document embedding utilities for Large Language Model processing.
 *
 * Features:
 * - Markdown document chunking with frontmatter extraction
 * - TypeScript/TSX TSDoc extraction and chunking
 * - Glob pattern support for file collection
 * - Recursive directory processing
 * - Dry-run mode for testing without actual processing
 * - Git diff-based processing for workflow integration
 *
 * Usage:
 *   $ ffc ai embeddings [options] <file-or-directory>
 *
 * Options:
 *   --dry-run              Show what would be processed without actually doing it
 *   --recursive            Process directories recursively
 *   --diff                 Process only changed files (workflow mode)
 *   --base-ref <ref>       Git reference to compare against (default: HEAD~1)
 *   --clean                Delete all existing documents from the vector store before processing
 *   --pattern <glob>       Glob pattern to match files
 *   --model <model>        Embedding model to use (default: text-embedding-ada-002)
 *   --batch-size <size>    Batch size for processing (default: 10)
 *
 * Examples:
 *   $ ffc ai embeddings --dry-run ./src
 *   $ ffc ai embeddings --recursive --pattern
 *   $ ffc ai embeddings --diff ./src
 *   $ ffc ai embeddings --diff --base-ref origin/main ./src
 *   $ ffc ai embeddings --clean ./src
 */
/**
 * Command options for the embeddings command
 */
type CommandOptions = AiOptions & {
  /** Show what would be processed without actually doing it */
  dryRun: boolean;
  /** Path to a config file */
  config: string;
  /** Process directories recursively */
  recursive: boolean;
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
    // Load configuration from fusion-ai.config.ts (or custom config path)
    const config = await importConfig<() => FusionAIConfig>(options.config, {
      baseDir: process.cwd(),
    }).then((config) => config.config());

    // Use patterns from config or default to TypeScript and Markdown files
    const allowedFilePatterns = config.patterns ?? ['**/*.ts', '**/*.md'];

    // Use provided patterns or fall back to config patterns
    const filePatterns = patterns.length ? patterns : allowedFilePatterns;

    // Initialize framework and get embedding service
    const framework = await setupFramework(options);
    const embeddingService = framework.ai.getService(
      'embeddings',
      options.openaiEmbeddingDeployment!,
    );

    // Clean existing vector store if requested
    // This removes all documents before processing new ones (useful for full re-indexing)
    if (options.clean) {
      const vectorStoreService = framework.ai.getService('search', options.azureSearchIndexName!);
      if (!options.dryRun) {
        console.log('🧹 Cleaning vector store: deleting all existing documents...');
        // Delete all documents using an OData filter that matches any document with a source
        // This effectively deletes all documents since all indexed documents have a source
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
        if (options.dryRun) {
          console.log(
            'Changed files:',
            changedFiles.map((f) => f.filepath.replace(process.cwd(), '.')).join('\n  '),
          );
        }
      } catch (error) {
        console.error(
          `❌ Git diff error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        process.exit(1);
      }
    }

    // Create observable stream of files to process
    // In diff mode: use changed files from git
    // In normal mode: use globby to find files matching patterns
    const files$ = options.diff
      ? from(changedFiles)
      : from(
          globbyStream(filePatterns, {
            onlyFiles: true,
            gitignore: true,
            absolute: true,
          }),
        ).pipe(
          // Get git status for each file (new, modified, removed)
          mergeMap((path) => getFileStatus(path)),
          // Flatten array of file statuses into individual emissions
          concatMap((files) => from(files)),
          // Share the stream so multiple subscribers can use it
          shareReplay({ refCount: true }),
        );

    // Handle removed files: delete their documents from vector store
    // This keeps the index in sync with the codebase
    files$.pipe(filter((file) => file.status === 'removed')).subscribe({
      next: (file) => {
        if (options.dryRun) {
          console.log('removed file', file.filepath);
        } else {
          // Delete all documents with matching source path from vector store
          const vectorStoreService = framework.ai.getService(
            'search',
            options.azureSearchIndexName!,
          );
          vectorStoreService.deleteDocuments({
            filter: { filterExpression: `metadata/source eq '${file.filepath}'` },
          });
        }
      },
      error: (error) => {
        console.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
      },
    });

    // Process files: filter out removed files, resolve project roots, and match patterns
    const processedFiles$ = files$.pipe(
      // Skip removed files (already handled above)
      filter((file) => file.status !== 'removed'),
      // Enrich file info with project root and relative path
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
      // Filter files to only those matching allowed patterns from config
      filter((file) => {
        const matches = multimatch(file.relativePath, allowedFilePatterns);
        return matches.length > 0;
      }),
      // Log each file being processed
      tap((file) => console.log('processing file', file.relativePath)),
      // Share stream for multiple subscribers (markdown and typescript processing)
      shareReplay({ refCount: true }),
    );

    // Process Markdown files: parse and chunk into documents
    const markdown$ = processedFiles$.pipe(
      filter((file) => isMarkdownFile(file.path)),
      mergeMap(async (file) => {
        // Parse markdown file and extract chunks with frontmatter
        const documents = await parseMarkdownFile(file);
        return { status: file.status, documents };
      }),
    );

    // Process TypeScript files: extract TSDoc comments and chunk into documents
    const typescript$ = processedFiles$.pipe(
      filter((file) => isTypescriptFile(file.path)),
      map((file) => {
        // Parse TypeScript file synchronously and extract TSDoc comments
        const documents = parseTsDocFromFileSync(file);
        return { status: file.status, documents };
      }),
    );

    // Merge markdown and typescript streams, then enrich documents with metadata
    const applyMetadata$ = merge(markdown$, typescript$).pipe(
      mergeMap((entry) => {
        return from(entry.documents).pipe(
          // Extract git metadata (commit hash, author, etc.) for each document
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
          // Apply custom attribute processor from config (if provided)
          // This allows users to transform or filter metadata attributes
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
          // Collect all documents from this file into an array
          toArray(),
        );
      }),
    );

    // Generate embeddings for each document's content
    // Embeddings are vector representations used for semantic search
    const applyEmbedding$ = applyMetadata$.pipe(
      mergeMap((documents) =>
        from(documents).pipe(
          mergeMap(async (document) => {
            console.log('embedding document', document.metadata.source);
            // Generate embedding vector for document content
            const embeddings = await embeddingService.embedQuery(document.pageContent);
            // Store embedding in metadata (some vector stores require this)
            const metadata = { ...document.metadata, embedding: embeddings };
            return { ...document, metadata };
          }),
          // Collect all embedded documents from this batch
          toArray(),
        ),
      ),
    );

    // Update vector store with embedded documents
    // This is the final step: add documents to the search index
    const updateVectorStore$ = applyEmbedding$.pipe(
      mergeMap(async (documents) => {
        const vectorStoreService = framework.ai.getService('search', options.azureSearchIndexName!);
        if (documents.length === 0) {
          return [];
        }

        // For multiple documents, delete existing documents from the same sources first
        // This ensures we don't have duplicate or stale documents in the index
        // Note: This creates a brief window where documents are missing from search
        // A more robust solution would use upsert operations if available
        if (documents.length > 1) {
          // Collect unique source paths from all documents
          const sources = documents
            .map((document) => document.metadata.source)
            .reduce((acc, source) => acc.add(source), new Set());

          // Build OData filter expression to match all documents from these sources
          const filterExpression = Array.from(sources)
            .map((source) => `metadata/source eq '${source}'`)
            .join(' or ');

          // Delete existing documents before adding new ones
          // This is a simple approach but creates a brief gap in search availability
          // TODO: Consider implementing upsert or atomic replace operations
          vectorStoreService.deleteDocuments({ filter: { filterExpression } });
        }

        console.log('Adding documents to vector store', documents.length);
        for (const document of documents) {
          console.log('source:', document?.metadata?.source);
        }

        // Add all documents to the vector store
        return await vectorStoreService.addDocuments(documents);
      }),
    );

    // Execute the pipeline based on mode
    if (options.dryRun) {
      // Dry run mode: show what would be processed without actually doing it
      let documentCount = 0;
      console.log('Dry run mode enabled');
      applyMetadata$.subscribe({
        next: (documents) => {
          // Display document preview for each document that would be processed
          documents.forEach((document) => {
            console.log('\n--------------------------------');
            console.log('id', document.id);
            console.log('pageContent', document.pageContent.slice(0, 100), '...');
            console.log('attributes', document?.metadata?.attributes);
            console.log('source', document?.metadata?.source);
            console.log('--------------------------------\n');
          });
          documentCount += documents.length;
        },
        error: (error) => {
          console.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          process.exit(1);
        },
        complete: () => {
          console.log(`✅ ${documentCount} documents would be processed`);
          process.exit(0);
        },
      });
    } else {
      // Production mode: actually process and index documents
      updateVectorStore$.subscribe({
        next: (results) => {
          // Log results from vector store operations
          console.log(results);
        },
        error: (error) => {
          console.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          process.exit(1);
        },
        complete: () => {
          console.log('✅ Embeddings generation completed!');
          process.exit(0);
        },
      });
    }
  });

export const command = withAiOptions(_command, {
  includeEmbedding: true,
  includeSearch: true,
});

export default command;
