import { globbyStream } from 'globby';
import { from, mergeMap, concatMap, shareReplay } from 'rxjs';
import type { Observable } from 'rxjs';
import { getFileStatus } from '../utils/git/index.js';
import type { ChangedFile } from '../utils/git/index.js';
import type { CommandOptions } from '../command-options-schema.js';

/**
 * Creates a file stream based on diff mode or glob patterns.
 *
 * @param options - Command options; `options.diff` selects diff mode.
 * @param changedFiles - Pre-resolved changed files, used when `options.diff` is set.
 * @param filePatterns - Glob patterns to scan when not in diff mode.
 * @returns An observable emitting each matched {@link ChangedFile}.
 * @internal
 */
export function createFileStream(
  options: CommandOptions,
  changedFiles: ChangedFile[],
  filePatterns: string[],
): Observable<ChangedFile> {
  // Diff mode reuses the already-resolved changed files instead of globbing.
  if (options.diff) {
    return from(changedFiles);
  }

  return (
    from(
      globbyStream(filePatterns, {
        onlyFiles: true,
        gitignore: true,
        absolute: true,
      }),
    )
      // Get git status concurrently, then flatten array results
      .pipe(
        mergeMap((path) => getFileStatus(path)),
        concatMap((files) => from(files)),
        // Share stream for multiple subscribers (removedFiles$ and indexFiles$)
        shareReplay({ refCount: true }),
      )
  );
}
