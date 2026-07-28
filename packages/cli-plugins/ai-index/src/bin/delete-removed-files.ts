import { map, mergeMap, toArray, filter } from 'rxjs';
import type { Observable } from 'rxjs';
import type { FrameworkInstance } from '@equinor/fusion-framework-cli-plugin-ai-base';
import type { ProcessedFile, DeleteRemovedFilesResult } from './types.js';
import type { CommandOptions } from '../embeddings-command.options.js';

/**
 * Creates a stream that deletes removed files from the vector store.
 *
 * @param removedFiles$ - Stream of files detected as removed from the source tree.
 * @param framework - Framework instance used to access the configured vector store.
 * @param options - Command options controlling target index and dry-run behavior.
 * @returns A stream emitting the result of each batch deletion.
 * @internal
 */
export function createDeleteRemovedFilesStream(
  removedFiles$: Observable<ProcessedFile>,
  framework: FrameworkInstance,
  options: CommandOptions,
): Observable<DeleteRemovedFilesResult> {
  // Batch removed files, then build a single OData filter for deletion
  return removedFiles$.pipe(
    toArray(),
    map((files) => {
      // Nothing to delete when there are no removed files
      if (files.length === 0) {
        return { files: [], filterExpression: null };
      }
      // Build OData filter: "metadata/source eq 'path1' or metadata/source eq 'path2'"
      const filterExpression = files
        // Escape each removed file into an OData equality clause
        .map((file) => `metadata/source eq '${file.relativePath}'`)
        .join(' or ');
      return { files, filterExpression };
    }),
    mergeMap(async ({ files, filterExpression }) => {
      // Skip the deletion call entirely when there is nothing to remove
      if (files.length === 0) {
        return undefined;
      }
      // Log each removed file for visibility before deleting
      for (const file of files) {
        console.log('Removing entry from vector store', file.relativePath);
      }
      // Skip the actual vector store mutation when running in dry-run mode
      if (!options.dryRun) {
        const vectorStoreService = framework.ai.useIndex(options.indexName);
        // Single batch deletion - one file can produce multiple document chunks
        await vectorStoreService.deleteDocuments({
          filter: { filterExpression: filterExpression ?? undefined },
        });
      }
      return {
        status: 'deleted',
        files: files as { relativePath: string }[],
      };
    }),
    filter((result): result is DeleteRemovedFilesResult => Boolean(result)),
  );
}
