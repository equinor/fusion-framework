import type AdmZip from 'adm-zip';
import { type BundleMetadata, loadMetadata } from './load-bundle-metadata.js';

/**
 * Resolves complete application information from a bundle artifact.
 *
 * This function extracts metadata.json from the provided
 * bundle ZIP file and validates that all required fields are present. The extracted
 * information can be used for app validation without requiring a local package.json.
 *
 * @param bundle - The AdmZip instance representing the app bundle
 * @returns A promise that resolves to the complete app information including appKey, name, version
 * @throws {Error} If metadata.json is missing or cannot be parsed
 * @throws {Error} If required fields are missing from the extracted data
 * @public
 */
export const resolveAppFromArtifact = async (bundle: AdmZip): Promise<BundleMetadata> => {
  // Extract and validate metadata.json
  const metadata = await loadMetadata(bundle);

  // Validate that the manifest contains the required appKey
  if (!metadata.appKey || typeof metadata.appKey !== 'string' || metadata.appKey.trim() === '') {
    throw new Error('App manifest is missing required appKey field');
  }

  return metadata;
};

export default resolveAppFromArtifact;
