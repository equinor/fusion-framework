import { concat } from 'rxjs';
import type { DeleteRemovedFilesResult, UpdateVectorStoreResult } from './types.js';
import type { Observable } from 'rxjs';

/**
 * Executes the pipeline and tracks results.
 * @internal
 */
export function executePipeline(
  deleteRemovedFiles$: Observable<DeleteRemovedFilesResult>,
  updateVectorStore$: Observable<UpdateVectorStoreResult>,
): void {
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
}
