// Loads the metadata (name and version) from a bundle zip file.
// Throws an error if the metadata.json file is missing or invalid.
import type AdmZip from 'adm-zip';

/**
 * The shape of the metadata loaded from the bundle zip file.
 */
export type BundleMetadata = {
  name: string;
  version: string;
};

/**
 * Loads the metadata from a bundle zip file.
 * @param bundle - The AdmZip instance representing the bundle.
 * @returns A promise resolving to an object containing name and version.
 * @throws If metadata.json is missing or cannot be parsed.
 */
export const loadMetadata = (bundle: AdmZip): Promise<BundleMetadata> => {
  // Attempt to retrieve the metadata.json entry from the zip bundle
  const metadataEntry = bundle.getEntry('metadata.json');
  if (!metadataEntry) {
    // If not found, throw an error
    throw new Error('Metadata file not found in bundle');
  }
  // Read the metadata entry asynchronously
  return new Promise((resolve, reject) => {
    metadataEntry.getDataAsync((data, err) => {
      if (err) {
        // Reject if reading the file fails
        return reject(new Error('Failed to read metadata file', { cause: err }));
      }
      try {
        // Parse the metadata as JSON and resolve
        return resolve(JSON.parse(String(data)));
      } catch (error) {
        // Reject if parsing fails
        reject(new Error('Failed to parse metadata file', { cause: error }));
      }
    });
  });
};
