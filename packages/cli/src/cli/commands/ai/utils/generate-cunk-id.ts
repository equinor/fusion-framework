export const generateChunkId = (filePath: string, chunkIndex?: number): string => {
  const pathHash = Buffer.from(filePath)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '');
  return chunkIndex ? `${pathHash}-${chunkIndex}` : pathHash;
};
