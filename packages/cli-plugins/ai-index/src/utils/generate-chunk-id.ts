/**
 * Generates a unique identifier for a document chunk based on file path
 * Creates a deterministic, URL-safe hash from the file path for validation and checks
 * @param filePath - The file path to generate an ID from
 * @param chunkIndex - Optional chunk index to append for multi-chunk documents
 * @returns A base64-encoded hash of the file path, optionally suffixed with chunk index
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
