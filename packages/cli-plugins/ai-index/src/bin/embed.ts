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
  DeleteRemovedFilesResult,
  ProcessedFile,
  UpdateVectorStoreResult,
} from './types.js';
import type { ChangedFile } from '../utils/git/index.js';
import type { CommandOptions } from '../embeddings-command.options.js';
import type { FusionAIConfigWithIndex } from '../config.js';
import type { FrameworkInstance } from '@equinor/fusion-framework-cli-plugin-ai-base';
import type { VectorStoreDocument } from '@equinor/fusion-framework-module-ai/lib';
import type { Observable } from 'rxjs';
import { readFileSync } from 'node:fs';
import { generateChunkId } from '../utils/generate-chunk-id.js';

/** Braille spinner frames (same as ora's default). */
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

/** Whether the process is running in a non-interactive environment (CI). */
const IS_CI = !process.stdout.isTTY || Boolean(process.env.CI);

/**
 * Manages a fixed block of sticky progress lines with per-line spinners.
 * Each line can be updated independently without overwriting the others.
 *
 * In non-interactive environments (CI) the ANSI cursor-movement dance is
 * replaced with simple `console.log` lines so the output is readable in
 * plain-text log viewers.
 * @internal
 */
class ProgressDisplay {
  private lines: string[] = [];
  private spinning: boolean[] = [];
  private started = false;
  private frame = 0;
  private timer: ReturnType<typeof setInterval> | undefined;

  /** Tracks last CI log time per line to throttle output. */
  private lastCiLog: number[] = [];

  /** Minimum interval (ms) between CI progress lines for the same line slot. */
  private static CI_LOG_INTERVAL_MS = 15_000;

  /**
   * Register the line labels up front and print empty placeholders.
   * @param count - Number of progress lines to reserve.
   */
  start(count: number): void {
    this.lines = new Array<string>(count).fill('');
    this.spinning = new Array<boolean>(count).fill(false);
    this.lastCiLog = new Array<number>(count).fill(0);

    // Skip the ANSI cursor block in CI — plain console.log lines are used instead
    if (!IS_CI) {
      // Print placeholder lines so the cursor block exists
      for (let i = 0; i < count; i++) {
        process.stdout.write('\n');
      }
      // Tick spinner at 80ms (same cadence as ora)
      this.timer = setInterval(() => this.tick(), 80);
    }
    this.started = true;
  }

  /**
   * Update a specific line (0-indexed) without touching the others.
   * @param line - Index of the progress line to update.
   * @param message - Message to display on that line.
   */
  update(line: number, message: string): void {
    // Nothing to update before the display has been started
    if (!this.started) return;
    this.lines[line] = message;
    this.spinning[line] = true;
    // In CI, throttle to plain log lines instead of redrawing the cursor block
    if (IS_CI) {
      const now = Date.now();
      // Only log again once the throttle interval has elapsed for this line
      if (now - this.lastCiLog[line] >= ProgressDisplay.CI_LOG_INTERVAL_MS) {
        this.lastCiLog[line] = now;
        console.log(`⏳ ${message}`);
      }
      return;
    }
    this.render(line);
  }

  /**
   * Mark a line as completed — stops its spinner and shows a checkmark.
   * @param line - Index of the progress line to complete.
   * @param message - Final message to display on that line.
   */
  succeed(line: number, message: string): void {
    // Nothing to update before the display has been started
    if (!this.started) return;
    const text = `✅ ${message}`;
    this.lines[line] = text;
    this.spinning[line] = false;
    // In CI, print the final line directly instead of redrawing the cursor block
    if (IS_CI) {
      console.log(text);
      return;
    }
    this.render(line);
  }

  /** Clear all progress lines and leave the cursor on a clean line. */
  clear(): void {
    // Nothing to clear before the display has been started
    if (!this.started) return;
    // Stop the spinner tick before tearing down the display
    if (this.timer) clearInterval(this.timer);
    // Skip cursor cleanup entirely in CI, where no cursor block was drawn
    if (!IS_CI) {
      // Move up to the first progress line and clear each one
      for (let i = 0; i < this.lines.length; i++) {
        const linesUp = this.lines.length - i;
        process.stdout.write(`\x1b[${linesUp}A\x1b[2K\r\x1b[${linesUp}B\r`);
      }
      // Move cursor up past the now-empty block
      process.stdout.write(`\x1b[${this.lines.length}A\r`);
    }
    this.started = false;
  }

  /** Advance the spinner frame and re-render all spinning lines. */
  private tick(): void {
    this.frame = (this.frame + 1) % SPINNER_FRAMES.length;
    // Re-render every line, skipping ones that aren't currently spinning
    for (let i = 0; i < this.lines.length; i++) {
      // Only re-render lines that are still actively spinning
      if (this.spinning[i] && this.lines[i]) {
        this.render(i);
      }
    }
  }

  /**
   * Render a single line at its position.
   * @param line - Index of the progress line to render.
   */
  private render(line: number): void {
    const linesUp = this.lines.length - line;
    const prefix = this.spinning[line] ? SPINNER_FRAMES[this.frame] : '';
    const text = this.spinning[line] ? `${prefix} ${this.lines[line]}` : this.lines[line];
    process.stdout.write(`\x1b[${linesUp}A\x1b[2K\r${text}\x1b[${linesUp}B\r`);
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

/**
 * Number of texts to embed per API request.
 *
 * Azure OpenAI accepts up to 2 048 inputs per embedding call.
 * LangChain's `batchSize` default is 1 (!) so we also set it on the
 * client constructor.  This outer batch controls how many documents
 * are grouped before handing them to the embed client.
 */
const EMBED_BATCH_SIZE = 500;

/**
 * Number of concurrent embedding API requests in flight.
 *
 * Each request now carries EMBED_BATCH_SIZE texts in a single HTTP call
 * (LangChain batchSize is aligned), so 3 concurrent requests should
 * saturate most Azure OpenAI TPM quotas without triggering rate limits.
 */
const EMBED_BATCH_CONCURRENCY = 3;

/**
 * Maximum time (ms) to wait before flushing a partial embedding batch.
 *
 * A longer window lets more documents accumulate before triggering an
 * HTTP call, which drastically cuts the number of round-trips when
 * upstream (metadata enrichment) feeds documents slowly.
 *
 * Full batches (EMBED_BATCH_SIZE) are emitted immediately regardless of
 * the timer, and `bufferTime` flushes any remainder the instant the
 * source stream completes — so a large value only affects mid-stream
 * partial batches, not tail latency.
 */
const EMBED_BUFFER_FLUSH_MS = 10_000;

/** Maximum retry attempts for transient / rate-limit errors per chunk. */
const MAX_RETRIES = 4;

/**
 * Prints resolved run configuration for `--debug` troubleshooting.
 *
 * @param options - Resolved command options for this run.
 * @param filePatterns - Glob patterns used to discover files to index.
 * @param config - Fusion AI index configuration for this run.
 */
function logDebugConfig(
  options: CommandOptions,
  filePatterns: string[],
  config: FusionAIConfigWithIndex,
): void {
  console.debug('[debug] Embed model:', options.embedModel);
  console.debug('[debug] File patterns:', filePatterns);
  console.debug(
    '[debug] Allowed patterns:',
    config.index?.patterns ?? ['**/*.ts', '**/*.tsx', '**/*.md', '**/*.mdx'],
  );
  console.debug('[debug] Raw patterns:', config.index?.rawPatterns ?? []);
  console.debug('[debug] Ignore patterns:', config.index?.ignore ?? defaultIgnore);
  console.debug('[debug] Diff mode:', options.diff);
  console.debug('[debug] Dry run:', options.dryRun);
  console.debug('[debug] Clean:', options.clean);
}

/**
 * Deletes all existing documents from the vector store when `--clean` is set.
 * No-op in dry-run mode or when `--clean` was not requested.
 *
 * @param framework - Framework instance used to access the configured vector store.
 * @param options - Resolved command options for this run.
 */
async function cleanVectorStoreIfRequested(
  framework: FrameworkInstance,
  options: CommandOptions,
): Promise<void> {
  // Only wipe the index when explicitly requested and not in dry-run mode
  if (!options.clean || options.dryRun) {
    return;
  }
  console.log('🧹 Cleaning vector store: deleting all existing documents...');
  const vectorStoreService = framework.ai.useIndex(options.indexName);
  // OData filter: delete all documents with non-empty source (all indexed docs)
  await vectorStoreService.deleteDocuments({
    filter: { filterExpression: "metadata/source ne ''" },
  });
  console.log('✅ Vector store cleaned successfully');
}

/**
 * Creates the raw file stream: diff mode reuses already-resolved changed
 * files, normal mode globs the filesystem and resolves git status per match.
 *
 * @param options - Resolved command options for this run.
 * @param config - Fusion AI index configuration for this run.
 * @param filePatterns - Glob patterns used to discover files to index.
 * @param changedFiles - Pre-resolved changed files, used when `options.diff` is set.
 * @returns A stream emitting each matched {@link ChangedFile}.
 */
function createFileStream$(
  options: CommandOptions,
  config: FusionAIConfigWithIndex,
  filePatterns: string[],
  changedFiles: ChangedFile[],
): Observable<ChangedFile> {
  // Diff mode reuses the already-resolved changed files instead of globbing.
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
  )
    // Resolve git status for each matched file, then flatten to individual files
    .pipe(
      // Get git status concurrently (capped to avoid spawning too many git processes)
      mergeMap((path) => getFileStatus(path), GIT_CONCURRENCY),
      concatMap((files) => from(files)),
      // Share stream for multiple subscribers (removedFiles$ and indexFiles$)
      shareReplay({ refCount: true }),
    );
}

/**
 * Enriches each file with its project-relative path and filters out files
 * that don't match the configured index patterns.
 *
 * @param files$ - Raw file stream from {@link createFileStream$}.
 * @param config - Fusion AI index configuration for this run.
 * @param debug - Whether to log skipped files for troubleshooting.
 * @param progress - Progress display used to report parsing progress.
 * @returns A stream of {@link ProcessedFile} entries matching the allowed patterns.
 */
function createProcessedFilesStream$(
  files$: Observable<ChangedFile>,
  config: FusionAIConfigWithIndex,
  debug: boolean,
  progress: ProgressDisplay,
): Observable<ProcessedFile> {
  const allowedFilePatterns = config.index?.patterns ?? [
    '**/*.ts',
    '**/*.tsx',
    '**/*.md',
    '**/*.mdx',
  ];

  let fileCount = 0;
  return files$
    // Resolve each file's project-relative path and filter by allowed patterns
    .pipe(
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
        // Surface skipped files in debug output for troubleshooting pattern config
        if (debug && matches.length === 0) {
          console.debug('[debug] Skipped (no pattern match):', file.relativePath);
        }
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
}

/**
 * Parses new/modified files (raw, markdown, or TypeScript) into document
 * entries ready for metadata enrichment.
 *
 * @param indexFiles$ - Stream of new/modified files to parse.
 * @param config - Fusion AI index configuration for this run.
 * @param debug - Whether to log per-file chunk counts for troubleshooting.
 * @param progress - Progress display used to report parsing progress.
 * @returns A stream of {@link DocumentEntry} objects, one per parsed file.
 */
function createParsedDocumentsStream$(
  indexFiles$: Observable<ProcessedFile>,
  config: FusionAIConfigWithIndex,
  debug: boolean,
  progress: ProgressDisplay,
): Observable<DocumentEntry> {
  const isRawFile = (file: ProcessedFile): boolean => {
    const matches = multimatch(file.relativePath, config.index?.rawPatterns ?? []);
    // A file is "raw" when it matches any configured raw pattern
    if (matches.length > 0) {
      return true;
    }
    return false;
  };

  let docCount = 0;

  // Read raw-pattern files verbatim as a single document, skipping markdown/TS parsing
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

  // Parse markdown files not already handled as raw content
  const markdown$ = indexFiles$.pipe(
    filter((x) => !isRawFile(x)),
    filter((file) => isMarkdownFile(file.path)),
    mergeMap(async (file) => {
      const documents = await parseMarkdownFile(file);
      docCount++;
      // Surface per-file chunk counts in debug output
      if (debug) {
        console.debug(`[debug] Markdown ${file.relativePath} → ${documents.length} chunk(s)`);
      }
      progress.update(LINE_PARSE, `📄 Parsing [${docCount}] ${file.relativePath}`);
      return { status: file.status, documents };
    }),
  );

  // Parse TypeScript files not already handled as raw content
  const typescript$ = indexFiles$.pipe(
    filter((x) => !isRawFile(x)),
    filter((file) => isTypescriptFile(file.path)),
    map((file) => {
      const documents = parseTsDocFromFileSync(file);
      docCount++;
      // Surface per-file chunk counts in debug output
      if (debug) {
        console.debug(`[debug] TypeScript ${file.relativePath} → ${documents.length} chunk(s)`);
      }
      progress.update(LINE_PARSE, `📄 Parsing [${docCount}] ${file.relativePath}`);
      return { status: file.status, documents };
    }),
  );

  // Merge parsed streams and signal when all parsing is done
  return merge(rawFiles$, markdown$, typescript$).pipe(
    finalize(() => {
      progress.succeed(LINE_PARSE, `📄 Parsed ${docCount} files`);
    }),
  );
}

/** Mutable progress counters shared between a pipeline stage and the final reporter. */
interface StageProgressState {
  count: number;
  done: boolean;
}

/**
 * Applies metadata enrichment to parsed documents and tracks progress.
 *
 * @param parsed$ - Stream of parsed document entries.
 * @param config - Fusion AI index configuration for this run.
 * @param progress - Progress display used to report metadata progress.
 * @returns The enriched document stream along with its progress state.
 */
function createMetadataStream$(
  parsed$: Observable<DocumentEntry>,
  config: FusionAIConfigWithIndex,
  progress: ProgressDisplay,
): { stream$: Observable<VectorStoreDocument[]>; state: StageProgressState } {
  const state: StageProgressState = { count: 0, done: false };
  // Track metadata progress via the callback, then mark the stage done on completion
  const stream$ = applyMetadata(parsed$, config.index, (source) => {
    state.count++;
    progress.update(LINE_META, `🏷️  Metadata [${state.count}] ${source}`);
  }).pipe(
    finalize(() => {
      state.done = true;
      progress.succeed(LINE_META, `🏷️  Metadata ${state.count} documents`);
    }),
  );
  return { stream$, state };
}

/**
 * Generates embeddings in batches with retry on rate-limit (429) errors.
 *
 * @param documents$ - Stream of schema-resolved document batches to embed.
 * @param embeddingService - Embedding client used to compute document vectors.
 * @param debug - Whether to log batch sizes for troubleshooting.
 * @param progress - Progress display used to report embedding progress.
 * @param metadataState - Progress state from {@link createMetadataStream$}, used as the denominator.
 * @returns The embedded document stream along with its progress state.
 */
function createEmbeddingStream$(
  documents$: Observable<VectorStoreDocument[]>,
  embeddingService: ReturnType<FrameworkInstance['ai']['useEmbed']>,
  debug: boolean,
  progress: ProgressDisplay,
  metadataState: StageProgressState,
): { stream$: Observable<VectorStoreDocument[]>; state: StageProgressState } {
  const state: StageProgressState = { count: 0, done: false };
  // Buffer, embed with retry, then re-attach embeddings onto each document
  const stream$ = documents$.pipe(
    // Flatten all documents from file-level batches, then re-batch for the API
    concatMap((documents) => from(documents)),
    // Flush when EMBED_BATCH_SIZE docs accumulate OR after EMBED_BUFFER_FLUSH_MS,
    // whichever comes first — prevents upstream starvation from blocking concurrency
    bufferTime(EMBED_BUFFER_FLUSH_MS, null, EMBED_BATCH_SIZE),
    filter((batch) => batch.length > 0),
    mergeMap((batch) => {
      // Surface batch sizes in debug output for troubleshooting throughput
      if (debug) {
        console.debug(`[debug] Embedding batch of ${batch.length} documents`);
      }
      return from(
        embeddingService.embedDocuments(
          batch
            // Extract each document's page content for the embedding API call
            .map((d) => d.pageContent),
        ),
      )
        // Retry transient/rate-limit errors, then attach embeddings back onto each document
        .pipe(
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
          return batch
            // Re-attach the corresponding embedding onto each document in the batch
            .map((document, i) => {
            state.count++;
            const total = metadataState.done ? metadataState.count : 0;
            const pct = total > 0 ? ` ${Math.round((state.count / total) * 100)}%` : '';
            const denominator = total > 0 ? `/${total}` : '';
            progress.update(
              LINE_EMBED,
              `🧠 Embedding [${state.count}${denominator}]${pct} — ${document.metadata.source}`,
            );
            const metadata = { ...document.metadata, embedding: allEmbeddings[i] };
            return { ...document, metadata };
          });
        }),
      );
    }, EMBED_BATCH_CONCURRENCY),
    finalize(() => {
      state.done = true;
      progress.succeed(LINE_EMBED, `🧠 Embedded ${state.count} documents`);
    }),
  );
  return { stream$, state };
}

/**
 * Batches embedded documents and upserts them into the vector store.
 *
 * @param embedding$ - Stream of embedded document batches.
 * @param framework - Framework instance used to access the configured vector store.
 * @param options - Resolved command options for this run.
 * @param debug - Whether to log upserted document IDs for troubleshooting.
 * @returns A stream emitting the result of each batch upsert.
 */
function createUpsertStream$(
  embedding$: Observable<VectorStoreDocument[]>,
  framework: FrameworkInstance,
  options: CommandOptions,
  debug: boolean,
): Observable<UpdateVectorStoreResult> {
  return embedding$
    // Re-batch embedded documents into fixed-size groups for bulk upsert
    .pipe(
    // Flatten file-level batches, then re-batch into groups of 20 for bulk upsert
    concatMap((documents) => from(documents)),
    bufferCount(20),
    mergeMap(async (documents) => {
      const vectorStoreService = framework.ai.useIndex(options.indexName);
      // Nothing to upsert when the batch is empty
      if (documents.length === 0) {
        return undefined;
      }
      // Skip the actual vector store mutation when running in dry-run mode
      if (!options.dryRun) {
        // Surface upserted document IDs in debug output for troubleshooting
        if (debug) {
          console.debug(
            `[debug] Upserting batch of ${documents.length} documents:`,
            documents
              // Log just the IDs to keep debug output concise
              .map((d) => d.id),
          );
        }
        await vectorStoreService.addDocuments(documents);
      }
      return {
        status: 'added',
        documents,
      } as UpdateVectorStoreResult;
    }, UPSERT_CONCURRENCY),
    filter((result): result is UpdateVectorStoreResult => Boolean(result)),
  );
}

/**
 * Runs the deletion/upsert pipeline to completion, reporting progress and
 * a final summary, then exits the process.
 *
 * @param delete$ - Stream of removed-file deletion results.
 * @param upsert$ - Stream of document upsert results.
 * @param progress - Progress display used to report indexing progress.
 * @param embeddingState - Progress state from {@link createEmbeddingStream$}, used as the denominator.
 */
function runIndexingPipeline(
  delete$: Observable<DeleteRemovedFilesResult>,
  upsert$: Observable<UpdateVectorStoreResult>,
  progress: ProgressDisplay,
  embeddingState: StageProgressState,
): void {
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
        indexingResults.deleted.push(
          ...result.files
            // Reduce each deleted file entry down to its relative path for reporting.
            .map((file) => file.relativePath),
        );
      }
      // Track added documents with source and ID (one file can produce multiple IDs)
      else if (result.status === 'added') {
        indexingResults.added.push(
          ...result.documents
            // Reduce each added document down to its source path and id for reporting.
            .map((document) => ({
              source: document.metadata.source,
              id: document.id,
            })),
        );
        indexedCount += result.documents.length;
        // Use embeddedCount as denominator — only show % once embedding is done
        const total = embeddingState.done ? embeddingState.count : 0;
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
      // Only print an "indexed" summary line when documents were actually added
      if (indexingResults.added.length > 0) {
        console.log(`📥 Indexed: ${indexingResults.added.length} documents`);
      }
      console.log('✅ Embeddings generation completed!');
      process.exit(0);
    },
  });
}

/**
 * Main entry point for the embeddings bin.
 * Orchestrates the entire embeddings generation pipeline.
 *
 * @param binOptions - Framework, resolved options, config, and file patterns for this run.
 * @throws {Error} Propagates unrecoverable embedding/vector-store errors from the pipeline.
 * @internal
 */
export async function embed(binOptions: EmbeddingsBinOptions): Promise<void> {
  const { framework, options, config, filePatterns } = binOptions;
  const debug = options.debug ?? false;

  console.log(`📇 Index: ${options.indexName}`);

  // Print resolved run configuration when --debug is set
  if (debug) {
    logDebugConfig(options, filePatterns, config);
  }

  const progress = new ProgressDisplay();

  await cleanVectorStoreIfRequested(framework, options);

  // Handle diff-based processing (workflow mode)
  const changedFiles = options.diff ? await getDiff(options) : [];

  // Create file stream: diff mode uses git changes, normal mode uses globby
  const files$ = createFileStream$(options, config, filePatterns, changedFiles);

  // Enrich files with metadata and filter by allowed patterns
  const processedFiles$ = createProcessedFilesStream$(files$, config, debug, progress);

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

  // Parse raw/markdown/TypeScript files into document entries
  const parsed$ = createParsedDocumentsStream$(indexFiles$, config, debug, progress);

  // Apply metadata to documents
  const { stream$: applyMetadata$, state: metadataState } = createMetadataStream$(
    parsed$,
    config,
    progress,
  );

  // Resolve promoted schema fields (if schema is configured) — runs after
  // metadata enrichment so the resolver has access to git, package, and
  // custom attributes from attributeProcessor
  const applySchema$ = applySchema(applyMetadata$, config.index?.schema);

  // Generate embeddings in batches with retry on rate-limit (429) errors
  const embeddingService = framework.ai.useEmbed(options.embedModel);
  const { stream$: applyEmbedding$, state: embeddingState } = createEmbeddingStream$(
    applySchema$,
    embeddingService,
    debug,
    progress,
    metadataState,
  );

  // Update vector store — batch documents and upsert concurrently
  const upsert$ = createUpsertStream$(applyEmbedding$, framework, options, debug);

  // Execute pipeline and report final results
  runIndexingPipeline(delete$, upsert$, progress, embeddingState);
}
