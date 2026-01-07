import { map, mergeMap, toArray, filter } from 'rxjs';
import type { Observable } from 'rxjs';
import type { FrameworkInstance } from '@equinor/fusion-framework-cli-plugin-ai-base';
import type { ProcessedFile, DeleteRemovedFilesResult } from './types.js';
import type { CommandOptions } from '../command.options.js';

/**
 * Creates a stream that deletes removed files from the vector store.
 * @internal
 */
export function createDeleteRemovedFilesStream(
  removedFiles$: Observable<ProcessedFile>,
  framework: FrameworkInstance,
  options: CommandOptions,
): Observable<DeleteRemovedFilesResult> {
  return removedFiles$.pipe(
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
        const vectorStoreService = framework.ai.getService('search', options.azureSearchIndexName);
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
