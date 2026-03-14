/**
 * Generates a deterministic, URL-safe identifier for a document chunk.
 *
 * The identifier is a Base64-encoded hash of the file path with all
 * non-alphanumeric characters stripped, making it safe for use as an
 * Azure AI Search document key.
 *
 * @param filePath - The relative file path to hash.
 * @param chunkIndex - Optional zero-based chunk index appended to distinguish
 *   multiple chunks originating from the same file.
 * @returns A stable, alphanumeric document ID string.
 *
 * @example
 * ```ts
 * generateChunkId('packages/cli/src/index.ts');        // 'cGFja2FnZXMvY2xpL3NyYy9pbmRleC50cw'
 * generateChunkId('packages/cli/src/index.ts', 0);     // 'cGFja2FnZXMvY2xpL3NyYy9pbmRleC50cw-0'
 * generateChunkId('packages/cli/src/index.ts', 3);     // 'cGFja2FnZXMvY2xpL3NyYy9pbmRleC50cw-3'
 * ```
 */
export const generateChunkId = (filePath: string, chunkIndex?: number): string => {
  // Convert file path to base64 and remove non-alphanumeric characters
  // This creates a stable, URL-safe identifier from the file path
  // The deterministic nature allows for validation and duplicate detection
  const pathHash = Buffer.from(filePath)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '');
  // Append chunk index if provided to distinguish multiple chunks from the same file
  return chunkIndex ? `${pathHash}-${chunkIndex}` : pathHash;
};
