import path from 'node:path';
import { from, mergeMap, map, tap, toArray } from 'rxjs';
import type { Observable } from 'rxjs';
import type { VectorStoreDocument } from '@equinor/fusion-framework-module-ai/lib';
import { extractGitMetadata } from '../utils/git/index.js';
import { resolvePackage } from '../utils/package-resolver.js';
import type { DocumentEntry } from './types.js';
import type { FusionAIConfigWithIndex } from '../config.js';

/** Callback invoked after each document is enriched with metadata. */
export type MetadataProgressCallback = (source: string) => void;

/**
 * Creates a stream that applies metadata to documents.
 * @internal
 */
export function applyMetadata(
  document$: Observable<DocumentEntry>,
  indexConfig: FusionAIConfigWithIndex['index'],
  onProgress?: MetadataProgressCallback,
): Observable<VectorStoreDocument[]> {
  // Resolve packages if enabled
  const shouldResolvePackage = indexConfig?.metadata?.resolvePackage ?? false;

  /** Cap concurrent git subprocess calls to avoid overwhelming the OS process table. */
  const GIT_CONCURRENCY = 20;

  /**
   * Cap the number of file entries processed in parallel.
   * Each entry fans out to GIT_CONCURRENCY inner git calls, so
   * total concurrent git processes ≤ ENTRY_CONCURRENCY × GIT_CONCURRENCY.
   */
  const ENTRY_CONCURRENCY = 20;

  return document$.pipe(
    mergeMap((entry) => {
      return from(entry.documents).pipe(
        // Extract git metadata concurrently (capped to limit parallel git processes)
        mergeMap(async (document): Promise<VectorStoreDocument> => {
          const rootPath = document.metadata.rootPath ?? process.cwd();
          const sourcePath = path.join(rootPath, document.metadata.source);
          const gitMetadata =
            document.metadata.source && indexConfig?.metadata?.resolveGit !== false
              ? await extractGitMetadata(sourcePath)
              : {};

          // Resolve package information if enabled
          let packageMetadata = {};
          if (shouldResolvePackage && document.metadata.source) {
            packageMetadata = await resolvePackage(sourcePath)
              .then((pkg) => {
                return {
                  pkg_name: pkg?.name,
                  pkg_version: pkg?.version,
                  pkg_keywords: pkg?.keywords,
                };
              })
              .catch(() => ({}));
          }
          return {
            ...document,
            metadata: {
              ...document.metadata,
              attributes: {
                ...document.metadata.attributes,
                ...gitMetadata,
                ...packageMetadata,
              },
            },
          };
        }, GIT_CONCURRENCY),
        // Notify caller after each document is enriched
        tap((document) => onProgress?.(document.metadata.source)),
        // Apply custom attribute processor from config
        map((document: VectorStoreDocument) => {
          const attributeProcessor =
            indexConfig?.metadata?.attributeProcessor ||
            ((attributes: Record<string, unknown>, _document: VectorStoreDocument) => attributes);
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
    }, ENTRY_CONCURRENCY),
  );
}
