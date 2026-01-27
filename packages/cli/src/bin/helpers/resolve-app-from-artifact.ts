import type AdmZip from 'adm-zip';
import type { AppManifest } from '@equinor/fusion-framework-module-app';

/**
 * Metadata structure extracted from bundle's metadata.json file.
 */
export interface BundleMetadata {
  name: string;
  version: string;
}

/**
 * Complete app information resolved from artifact bundle.
 */
export interface ResolvedAppFromArtifact {
  /** The application key extracted from the manifest */
  appKey: string;
  /** The application name extracted from metadata */
  name: string;
  /** The application version extracted from metadata */
  version: string;
  /** The complete application manifest from the bundle */
  manifest: AppManifest;
}

/**
 * Resolves complete application information from a bundle artifact.
 *
 * This function extracts both metadata.json and app-manifest.json from the provided
 * bundle ZIP file and validates that all required fields are present. The extracted
 * information can be used for app validation without requiring a local package.json.
 *
 * @param bundle - The AdmZip instance representing the app bundle
 * @returns A promise that resolves to the complete app information including appKey, name, version, and manifest
 * @throws {Error} If metadata.json is missing or cannot be parsed
 * @throws {Error} If app-manifest.json is missing or cannot be parsed
 * @throws {Error} If required fields are missing from the extracted data
 * @public
 */
export const resolveAppFromArtifact = async (bundle: AdmZip): Promise<ResolvedAppFromArtifact> => {
  // Extract and validate metadata.json
  const metadata = await loadBundleMetadata(bundle);

  // Extract and validate app-manifest.json
  const manifest = await loadBundleManifest(bundle);

  // Validate that the manifest contains the required appKey
  if (!manifest.appKey) {
    throw new Error('App manifest is missing required appKey field');
  }

  return {
    appKey: manifest.appKey,
    name: metadata.name,
    version: metadata.version,
    manifest,
  };
};

/**
 * Loads the metadata from a bundle zip file.
 *
 * @param bundle - The AdmZip instance representing the bundle
 * @returns A promise resolving to an object containing name and version
 * @throws {Error} If metadata.json is missing or cannot be parsed
 */
const loadBundleMetadata = (bundle: AdmZip): Promise<BundleMetadata> => {
  const metadataEntry = bundle.getEntry('metadata.json');
  if (!metadataEntry) {
    throw new Error(
      'Metadata file (metadata.json) not found in bundle. This file is required for artifact-based validation.',
    );
  }

  return new Promise((resolve, reject) => {
    metadataEntry.getDataAsync((data, err) => {
      if (err) {
        return reject(new Error('Failed to read metadata.json file from bundle', { cause: err }));
      }
      try {
        const parsed = JSON.parse(String(data));

        // Validate required fields
        if (!parsed.name || typeof parsed.name !== 'string') {
          throw new Error('metadata.json is missing required "name" field');
        }
        if (!parsed.version || typeof parsed.version !== 'string') {
          throw new Error('metadata.json is missing required "version" field');
        }

        const metadata: BundleMetadata = {
          name: parsed.name,
          version: parsed.version,
        };

        return resolve(metadata);
      } catch (validationError) {
        // If it's a validation error, throw it directly
        if (
          validationError instanceof Error &&
          validationError.message.includes('is missing required')
        ) {
          reject(validationError);
        } else {
          // If it's a JSON parsing error, wrap it
          reject(new Error('Failed to parse metadata.json file', { cause: validationError }));
        }
      }
    });
  });
};

/**
 * Loads the application manifest from a bundle zip file.
 *
 * @param bundle - The AdmZip instance representing the bundle
 * @returns A promise resolving to the complete AppManifest object
 * @throws {Error} If app-manifest.json is missing or cannot be parsed
 */
const loadBundleManifest = (bundle: AdmZip): Promise<AppManifest> => {
  const manifestEntry = bundle.getEntry('app-manifest.json');
  if (!manifestEntry) {
    throw new Error(
      'App manifest file (app-manifest.json) not found in bundle. This file is required for artifact-based validation.',
    );
  }

  return new Promise((resolve, reject) => {
    manifestEntry.getDataAsync((data, err) => {
      if (err) {
        return reject(
          new Error('Failed to read app-manifest.json file from bundle', { cause: err }),
        );
      }
      try {
        const parsed = JSON.parse(String(data));

        // Validate required fields for AppManifest
        if (!parsed.appKey || typeof parsed.appKey !== 'string') {
          throw new Error('app-manifest.json is missing required "appKey" field');
        }
        if (!parsed.displayName || typeof parsed.displayName !== 'string') {
          throw new Error('app-manifest.json is missing required "displayName" field');
        }

        const manifest = parsed as AppManifest;
        return resolve(manifest);
      } catch (validationError) {
        // If it's a validation error, throw it directly
        if (
          validationError instanceof Error &&
          validationError.message.includes('is missing required')
        ) {
          reject(validationError);
        } else {
          // If it's a JSON parsing error, wrap it
          reject(new Error('Failed to parse app-manifest.json file', { cause: validationError }));
        }
      }
    });
  });
};

export default resolveAppFromArtifact;
