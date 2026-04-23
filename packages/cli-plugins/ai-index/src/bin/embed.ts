import { globbyStream } from 'globby';
import { relative } from 'node:path';
import multimatch from 'multimatch';
import { from, merge, timer } from 'rxjs';
import {
  bufferCount,
  bufferTime,
  concatMap,
  filter,
  finalize,
  map,
  mergeMap,
  retry,
  shareReplay,
  tap,
} from 'rxjs/operators';

import { isMarkdownFile, parseMarkdownFile } from '../utils/markdown/index.js';
import { getFileStatus, resolveProjectRoot } from '../utils/git/index.js';
import { isTypescriptFile, parseTsDocFromFileSync } from '../utils/ts-doc/index.js';

import { getDiff } from './get-diff.js';
import { createDeleteRemovedFilesStream } from './delete-removed-files.js';
import { applyMetadata } from './apply-metadata.js';
import { applySchema } from './apply-schema.js';
import type {
  DocumentEntry,
  EmbeddingsBinOptions,
  ProcessedFile,
  UpdateVectorStoreResult,
} from './types.js';
import type { VectorStoreDocument } from '@equinor/fusion-framework-module-ai/lib';
import { readFileSync } from 'node:fs';
import { generateChunkId } from '../utils/generate-chunk-id.js';

/** Braille spinner frames (same as ora's default). */
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

/**
 * Manages a fixed block of sticky progress lines with per-line spinners.
 * Each line can be updated independently without overwriting the others.
 * @internal
 */
class ProgressDisplay {
  private lines: string[] = [];
  private spinning: boolean[] = [];
  private started = false;
  private frame = 0;
  private timer: ReturnType<typeof setInterval> | undefined;

  /** Register the line labels up front and print empty placeholders. */
  start(count: number): void {
    this.lines = new Array<string>(count).fill('');
    this.spinning = new Array<boolean>(count).fill(false);
    // Print placeholder lines so the cursor block exists
    for (let i = 0; i < count; i++) {
      process.stdout.write('\n');
    }
    this.started = true;
    // Tick spinner at 80ms (same cadence as ora)
    this.timer = setInterval(() => this.tick(), 80);
  }

  /** Update a specific line (0-indexed) without touching the others. */
  update(line: number, message: string): void {
    if (!this.started) return;
    this.lines[line] = message;
    this.spinning[line] = true;
    this.render(line);
  }

  /** Mark a line as completed — stops its spinner and shows a checkmark. */
  succeed(line: number, message: string): void {
    if (!this.started) return;
    this.lines[line] = `✅ ${message}`;
    this.spinning[line] = false;
    this.render(line);
  }

  /** Clear all progress lines and leave the cursor on a clean line. */
  clear(): void {
    if (!this.started) return;
    if (this.timer) clearInterval(this.timer);
    // Move up to the first progress line and clear each one
    for (let i = 0; i < this.lines.length; i++) {
      const linesUp = this.lines.length - i;
      process.stdout.write(`\x1b[${linesUp}A\x1b[2K\r\x1b[${linesUp}B\r`);
    }
    // Move cursor up past the now-empty block
    process.stdout.write(`\x1b[${this.lines.length}A\r`);
    this.started = false;
  }

  /** Advance the spinner frame and re-render all spinning lines. */
  private tick(): void {
    this.frame = (this.frame + 1) % SPINNER_FRAMES.length;
    for (let i = 0; i < this.lines.length; i++) {
      if (this.spinning[i] && this.lines[i]) {
        this.render(i);
      }
    }
  }

  /** Render a single line at its position. */
  private render(line: number): void {
    const linesUp = this.lines.length - line;
    const prefix = this.spinning[line] ? SPINNER_FRAMES[this.frame] : '';
    const text = this.spinning[line] ? `${prefix} ${this.lines[line]}` : this.lines[line];
    process.stdout.write(
      `\x1b[${linesUp}A\x1b[2K\r${text}\x1b[${linesUp}B\r`,
    );
  }
}

/** Progress line indices */
const LINE_PARSE = 0;
const LINE_META = 1;
const LINE_EMBED = 2;
const LINE_INDEX = 3;

/**
 * Default directories to skip before expensive git operations.
 * These are common build artifacts and dependencies that should be ignored.
 * @internal
 */
const defaultIgnore = ['node_modules', '**/node_modules/**', 'dist', '**/dist/**', '.git'];

/** Concurrency limit for git subprocess operations (status, log, etc.). */
const GIT_CONCURRENCY = 20;

/** Maximum parallel upsert requests to the vector store. */
const UPSERT_CONCURRENCY = 10;

/** Number of texts to embed per API request. */
const EMBED_BATCH_SIZE = 20;

/** Number of concurrent batch requests in flight. */
const EMBED_BATCH_CONCURRENCY = 4;

/**
 * Maximum time (ms) to wait before flushing a partial embedding batch.
 * Without this, `bufferCount` waits indefinitely for a full batch, which
 * starves `mergeMap` concurrency when upstream document throughput is slow.
 */
const EMBED_BUFFER_FLUSH_MS = 250;

/** Maximum retry attempts for transient / rate-limit errors per chunk. */
const MAX_RETRIES = 4;

/**
 * Main entry point for the embeddings bin.
 * Orchestrates the entire embeddings generation pipeline.
 * @internal
 */
export async function embed(binOptions: EmbeddingsBinOptions): Promise<void> {
  const { framework, options, config, filePatterns } = binOptions;

  console.log(`📇 Index: ${options.indexName}`);

  const progress = new ProgressDisplay();

  // Handle clean operation (destructive - deletes all existing documents)
  const vectorStoreService = framework.ai.useIndex(options.indexName);
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

    // Respect .gitignore by default; configs targeting build artifacts can opt out.
    const gitignore = config.index?.gitignore ?? true;

    return from(
      globbyStream(filePatterns, {
        ignore,
        onlyFiles: true,
        gitignore,
        absolute: true,
      }),
    ).pipe(
      // Get git status concurrently (capped to avoid spawning too many git processes)
      mergeMap((path) => getFileStatus(path), GIT_CONCURRENCY),
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
  let fileCount = 0;
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
    tap((file) => {
      fileCount++;
      const label = file.status === 'removed' ? '🗑️' : '📄';
      progress.update(LINE_PARSE, `${label} Parsing [${fileCount}] ${file.relativePath}`);
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

  let docCount = 0;
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
      docCount++;
      progress.update(LINE_PARSE, `📄 Parsing [${docCount}] ${file.relativePath}`);
      return { status: file.status, documents: [document] };
    }),
  );

  const markdown$ = indexFiles$.pipe(
    filter((x) => !isRawFile(x)),
    filter((file) => isMarkdownFile(file.path)),
    mergeMap(async (file) => {
      const documents = await parseMarkdownFile(file);
      docCount++;
      progress.update(LINE_PARSE, `📄 Parsing [${docCount}] ${file.relativePath}`);
      return { status: file.status, documents };
    }),
  );

  const typescript$ = indexFiles$.pipe(
    filter((x) => !isRawFile(x)),
    filter((file) => isTypescriptFile(file.path)),
    map((file) => {
      const documents = parseTsDocFromFileSync(file);
      docCount++;
      progress.update(LINE_PARSE, `📄 Parsing [${docCount}] ${file.relativePath}`);
      return { status: file.status, documents };
    }),
  );

  // Merge parsed streams and signal when all parsing is done
  const parsed$ = merge(rawFiles$, markdown$, typescript$).pipe(
    finalize(() => {
      progress.succeed(LINE_PARSE, `📄 Parsed ${docCount} files`);
    }),
  );

  // Apply metadata to documents
  let metadataCount = 0;
  let metadataDone = false;
  const applyMetadata$ = applyMetadata(
    parsed$,
    config.index,
    (source) => {
      metadataCount++;
      progress.update(LINE_META, `🏷️  Metadata [${metadataCount}] ${source}`);
    },
  ).pipe(
    finalize(() => {
      metadataDone = true;
      progress.succeed(LINE_META, `🏷️  Metadata ${metadataCount} documents`);
    }),
  );

  // Resolve promoted schema fields (if schema is configured) — runs after
  // metadata enrichment so the resolver has access to git, package, and
  // custom attributes from attributeProcessor
  const applySchema$ = applySchema(applyMetadata$, config.index?.schema);

  // Generate embeddings in batches with retry on rate-limit (429) errors
  const embeddingService = framework.ai.useEmbed(options.embedModel);

  let embeddedCount = 0;
  let embeddingDone = false;
  const applyEmbedding$ = applySchema$.pipe(
    // Flatten all documents from file-level batches, then re-batch for the API
    concatMap((documents) => from(documents)),
    // Flush when EMBED_BATCH_SIZE docs accumulate OR after EMBED_BUFFER_FLUSH_MS,
    // whichever comes first — prevents upstream starvation from blocking concurrency
    bufferTime(EMBED_BUFFER_FLUSH_MS, null, EMBED_BATCH_SIZE),
    filter((batch) => batch.length > 0),
    mergeMap(
      (batch) =>
        from(embeddingService.embedDocuments(batch.map((d) => d.pageContent))).pipe(
          retry({
            count: MAX_RETRIES,
            delay: (error, retryIndex) => {
              // Auth errors are terminal — abort immediately with actionable message
              if (error?.name === 'NoAccountsError') {
                console.error(
                  '\n🔒 Authentication expired. Run `ffc auth login` then retry with `--diff`.',
                );
                throw error;
              }

              const retryAfterSec =
                error?.response?.headers?.get?.('retry-after') ??
                error?.responseHeaders?.['retry-after'];
              const retryAfterMs = retryAfterSec ? Number(retryAfterSec) * 1000 : 0;

              const backoffMs = 2 ** retryIndex * 1000;
              const delayMs = Math.max(backoffMs, retryAfterMs);

              console.warn(
                `\n⏳ Retry ${retryIndex}/${MAX_RETRIES} for batch of ${batch.length} in ${delayMs}ms`,
              );
              return timer(delayMs);
            },
          }),
          map((allEmbeddings) => {
            return batch.map((document, i) => {
              embeddedCount++;
              const total = metadataDone ? metadataCount : 0;
              const pct = total > 0 ? ` ${Math.round((embeddedCount / total) * 100)}%` : '';
              const denominator = total > 0 ? `/${total}` : '';
              progress.update(
                LINE_EMBED,
                `🧠 Embedding [${embeddedCount}${denominator}]${pct} — ${document.metadata.source}`,
              );
              const metadata = { ...document.metadata, embedding: allEmbeddings[i] };
              return { ...document, metadata };
            });
          }),
        ),
      EMBED_BATCH_CONCURRENCY,
    ),
    finalize(() => {
      embeddingDone = true;
      progress.succeed(LINE_EMBED, `🧠 Embedded ${embeddedCount} documents`);
    }),
  );

  // Update vector store — batch documents and upsert concurrently
  const upsert$ = applyEmbedding$.pipe(
    // Flatten file-level batches, then re-batch into groups of 20 for bulk upsert
    concatMap((documents) => from(documents)),
    bufferCount(20),
    mergeMap(async (documents) => {
      const vectorStoreService = framework.ai.useIndex(options.indexName);
      if (documents.length === 0) {
        return undefined;
      }
      if (!options.dryRun) {
        await vectorStoreService.addDocuments(documents);
      }
      return {
        status: 'added',
        documents,
      } as UpdateVectorStoreResult;
    }, UPSERT_CONCURRENCY),
    filter((result): result is UpdateVectorStoreResult => Boolean(result)),
  );

  // Execute pipeline
  // Track indexing results for reporting: deleted file paths and added document IDs
  let indexedCount = 0;
  const indexingResults: { deleted: string[]; added: { source: string; id: string }[] } = {
    deleted: [],
    added: [],
  };

  // Execute pipeline: merge runs deletions and additions concurrently so
  // the embedding pipeline can start as soon as metadata-enriched documents
  // are available, without waiting for all file discovery to complete.
  progress.start(4);
  merge(delete$, upsert$).subscribe({
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
        indexedCount += result.documents.length;
        // Use embeddedCount as denominator — only show % once embedding is done
        const total = embeddingDone ? embeddedCount : 0;
        const pct = total > 0 ? ` ${Math.round((indexedCount / total) * 100)}%` : '';
        const denominator = total > 0 ? `/${total}` : '';
        progress.update(LINE_INDEX, `📤 Indexed [${indexedCount}${denominator}]${pct}`);
      }
    },
    error: (error) => {
      console.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    },
    complete: () => {
      // Clear the progress block before final output
      progress.clear();
      // Pipeline completed - log summary
      if (indexingResults.deleted.length > 0) {
        console.log(`🗑️  Deleted: ${indexingResults.deleted.length} files`);
      }
      if (indexingResults.added.length > 0) {
        console.log(`📥 Indexed: ${indexingResults.added.length} documents`);
      }
      console.log('✅ Embeddings generation completed!');
      process.exit(0);
    },
  });
}
