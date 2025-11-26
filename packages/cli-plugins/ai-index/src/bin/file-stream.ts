import { globbyStream } from 'globby';
import { from, mergeMap, concatMap, shareReplay } from 'rxjs';
import type { Observable } from 'rxjs';
import { getFileStatus } from '../utils/git/index.js';
import type { ChangedFile } from '../utils/git/index.js';
import type { CommandOptions } from '../command.options.js';

/**
 * Creates a file stream based on diff mode or glob patterns.
 * @internal
 */
export function createFileStream(
  options: CommandOptions,
  changedFiles: ChangedFile[],
  filePatterns: string[],
): Observable<ChangedFile> {
  if (options.diff) {
    return from(changedFiles);
  }

  return from(
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
}
