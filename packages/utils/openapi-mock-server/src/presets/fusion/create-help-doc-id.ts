import { createHash } from 'node:crypto';

/** Fixed namespace so the same slug always maps to the same UUID, independent of file location. */
const ID_NAMESPACE = 'fusion-openapi-mock-server:help-';

/**
 * Derives a UUID (version 5 layout) from a help document's kind and slug, so the Help app's UUID
 * validation accepts it and tests can rely on the same id between requests and server restarts.
 *
 * @param kind - Document kind; an article and an FAQ may share a slug without sharing an id.
 * @param slug - Document slug.
 * @returns A deterministic, RFC 4122 formatted UUID.
 */
export function createHelpDocId(kind: 'article' | 'faq', slug: string): string {
  const bytes = createHash('sha1')
    .update(`${ID_NAMESPACE}${kind}:${slug}`)
    .digest()
    .subarray(0, 16);
  // Set version 5 and the RFC 4122 variant so strict UUID validators accept the id.
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export default createHelpDocId;
