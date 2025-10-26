import path, { relative } from 'node:path';

import { globbyStream } from 'globby';
import multimatch from 'multimatch';
import { from, filter, map, Subject, share, merge, toArray, concatMap, mergeMap, EMPTY } from 'rxjs';
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
} from './utils/extract-git-metadata.js';

import type { SourceFile } from './utils/types.js';
import type { FusionAIConfig } from '../../../lib/fusion-ai.js';

type CommandOptions = AiOptions & {
  dryRun: boolean;
  config: string;
  recursive: boolean;
  diff: boolean;
  baseRef?: string;
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
 *   --pattern <glob>       Glob pattern to match files
 *   --chunk-size <size>    Size of text chunks (default: 2000)
 *   --chunk-overlap <size> Overlap between chunks (default: 200)
 *   --model <model>        Embedding model to use (default: text-embedding-ada-002)
 *   --batch-size <size>    Batch size for processing (default: 10)
 *
 * Examples:
 *   $ ffc ai embeddings --dry-run ./src
 *   $ ffc ai embeddings --recursive --pattern
 *   $ ffc ai embeddings --chunk-size 1000 --model text-embedding-3-small ./packages
 *   $ ffc ai embeddings --diff ./src
 *   $ ffc ai embeddings --diff --base-ref origin/main ./src
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
  .argument('[glob-patterns...]', 'Glob patterns to match files (optional when using --diff)')
  .action(async (patterns: string[], options: CommandOptions) => {
    const config = await importConfig<() => FusionAIConfig>(options.config, {
      baseDir: process.cwd(),
    }).then((config) => config.config());

    const filePatterns = patterns.length ? patterns : (config.patterns ?? ['**/*.ts', '**/*.md']);

    // Validate that patterns are provided when not using --diff
    if (!options.diff && !filePatterns) {
      console.error('❌ Error: Glob patterns are required when not using --diff');
      process.exit(1);
    }

    const framework = await setupFramework(options);
    const embeddingService = framework.ai.getService(
      'embeddings',
      options.openaiEmbeddingDeployment!,
    );

    // Handle diff-based processing
    const changedFiles: string[] = [];
    if (options.diff) {
      try {
        const gitStatus = await getGitStatus();
        console.log(`🔍 Git status: ${gitStatus.branch}@${gitStatus.commit}`);
        console.log(
          `📊 Changes: ${gitStatus.stagedFiles} staged, ${gitStatus.unstagedFiles} unstaged`,
        );

        await getChangedFiles({
          diff: options.diff,
          baseRef: options.baseRef,
        })
          .then((files) => {
            if (patterns && patterns.length > 0) {
              console.log(`🎯 Filtering with patterns: ${patterns.join(', ')}`);
              return multimatch(files, patterns);
            }
            return files;
          })
          .then((files) => {
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
            changedFiles.map((f) => f.replace(process.cwd(), '.')).join('\n  '),
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
        );

    const processedFiles$ = files$.pipe(
      map((path) => {
        const projectRoot = resolveProjectRoot(path);
        return {
          path,
          projectRoot,
          relativePath: projectRoot ? relative(projectRoot, path) : path,
        };
      }),
      share({ connector: () => new Subject<SourceFile>() }),
    );

    const markdown$ = processedFiles$.pipe(
      filter((file) => isMarkdownFile(file.path)),
      mergeMap(async (file) => await parseMarkdownFile(file)),
    );

    const typescript$ = processedFiles$.pipe(
      filter((file) => isTypescriptFile(file.path)),
      map((file) => parseTsDocFromFileSync(file)),
    );

    const applyMetadata$ = merge(markdown$, typescript$).pipe(
      mergeMap((documents) => {
        return from(documents).pipe(
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
              config.metadata?.attributeProcessor || ((attributes) => attributes);
            const attributes = attributeProcessor(document.metadata.attributes ?? {});
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
        if(documents.length === 0) {
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
