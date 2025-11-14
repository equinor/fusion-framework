import path, { relative } from 'node:path';

import { globbyStream } from 'globby';
import multimatch from 'multimatch';
import { from, filter, map, shareReplay, merge, toArray, concatMap, mergeMap, tap } from 'rxjs';
import { createCommand, createOption } from 'commander';

import { importConfig } from '@equinor/fusion-imports';
import type { VectorStoreDocument } from '@equinor/fusion-framework-module-ai/lib';

import { type AiOptions, withAiOptions } from '../../options/ai.js';

import { setupFramework } from './utils/setup-framework.js';
import { isMarkdownFile, parseMarkdownFile } from './utils/parse-markdown.js';
import { isTypescriptFile, parseTsDocFromFileSync } from './utils/parse-ts-doc.js';
import {
  extractGitMetadata,
  resolveProjectRoot,
  getChangedFiles,
  getGitStatus,
  getFileStatus,
  type ChangedFile,
} from './utils/extract-git-metadata.js';

import type { FusionAIConfig } from '../../../lib/fusion-ai.js';

type CommandOptions = AiOptions & {
  dryRun: boolean;
  config: string;
  recursive: boolean;
  diff: boolean;
  baseRef?: string;
  clean: boolean;
};

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
    const config = await importConfig<() => FusionAIConfig>(options.config, {
      baseDir: process.cwd(),
    }).then((config) => config.config());

    const allowedFilePatterns = config.patterns ?? ['**/*.ts', '**/*.md'];

    const filePatterns = patterns.length ? patterns : allowedFilePatterns;

    const framework = await setupFramework(options);
    const embeddingService = framework.ai.getService(
      'embeddings',
      options.openaiEmbeddingDeployment!,
    );

    // Clean existing vector store if requested
    if (options.clean) {
      const vectorStoreService = framework.ai.getService('search', options.azureSearchIndexName!);
      if (!options.dryRun) {
        console.log('🧹 Cleaning vector store: deleting all existing documents...');
        // Delete all documents by using a filter that matches all documents
        // Using a filter that matches any document with a source (which should be all of them)
        await vectorStoreService.deleteDocuments({
          filter: { filterExpression: "metadata/source ne ''" },
        });
        console.log('✅ Vector store cleaned successfully');
      }
    }

    // Handle diff-based processing
    let changedFiles: ChangedFile[] = [];
    if (options.diff) {
      try {
        const gitStatus = await getGitStatus();
        console.log(`🔍 Git status: ${gitStatus.branch}@${gitStatus.commit}`);
        console.log(
          `📊 Changes: ${gitStatus.stagedFiles} staged, ${gitStatus.unstagedFiles} unstaged`,
        );

        changedFiles = await getChangedFiles({
          diff: options.diff,
          baseRef: options.baseRef,
        });
        await getChangedFiles({
          diff: options.diff,
          baseRef: options.baseRef,
        }).then((files) => {
          changedFiles.push(...files);
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

    const files$ = options.diff
      ? from(changedFiles)
      : from(
          globbyStream(filePatterns, {
            onlyFiles: true,
            gitignore: true,
            absolute: true,
          }),
        ).pipe(
          mergeMap((path) => getFileStatus(path)),
          concatMap((files) => from(files)),
          shareReplay({ refCount: true }),
        );

    files$.pipe(filter((file) => file.status === 'removed')).subscribe({
      next: (file) => {
        if (options.dryRun) {
          console.log('removed file', file.filepath);
        } else {
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

    const processedFiles$ = files$.pipe(
      filter((file) => file.status !== 'removed'),
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
      shareReplay({ refCount: true }),
    );

    const markdown$ = processedFiles$.pipe(
      filter((file) => isMarkdownFile(file.path)),
      mergeMap(async (file) => {
        const documents = await parseMarkdownFile(file);
        return { status: file.status, documents };
      }),
    );

    const typescript$ = processedFiles$.pipe(
      filter((file) => isTypescriptFile(file.path)),
      map((file) => {
        const documents = parseTsDocFromFileSync(file);
        return { status: file.status, documents };
      }),
    );

    const applyMetadata$ = merge(markdown$, typescript$).pipe(
      mergeMap((entry) => {
        return from(entry.documents).pipe(
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
          toArray(),
        );
      }),
    );

    const applyEmbedding$ = applyMetadata$.pipe(
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

    const updateVectorStore$ = applyEmbedding$.pipe(
      mergeMap(async (documents) => {
        const vectorStoreService = framework.ai.getService('search', options.azureSearchIndexName!);
        if (documents.length === 0) {
          return [];
        }
        if (documents.length > 1) {
          // make a distinct list of sources
          const sources = documents
            .map((document) => document.metadata.source)
            .reduce((acc, source) => acc.add(source), new Set());

          // create a filter expression for the sources
          const filterExpression = Array.from(sources)
            .map((source) => `metadata/source eq '${source}'`)
            .join(' or ');

          // will leave the index without the documents with the specified sources
          // so search will be missing these documents until we have re-added them
          // this is a cheap way to ensure the index is up to date
          // but it's not a perfect solution, might need to add a more robust solution later
          vectorStoreService.deleteDocuments({ filter: { filterExpression } });
        }
        console.log('Adding documents to vector store', documents.length);
        for (const document of documents) {
          console.log('source:', document?.metadata?.source);
        }
        return await vectorStoreService.addDocuments(documents);
      }),
    );

    if (options.dryRun) {
      let documentCount = 0;
      console.log('Dry run mode enabled');
      applyMetadata$.subscribe({
        next: (documents) => {
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
      updateVectorStore$.subscribe({
        next: (results) => {
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
