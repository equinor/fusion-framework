import { AppManifest } from './types';

// manifest properties to compare
const compareKey: Array<keyof AppManifest> = ['key', 'version'];

/**
 * Compares two app manifests for equality.
 *
 * @template T - The type of the app manifest.
 * @param a - The first app manifest.
 * @param b - The second app manifest.
 * @returns True if the app manifests are equal, false otherwise.
 */
export const compareAppManifest = <T extends AppManifest>(a?: T, b?: T): boolean => {
    // use compareKey to compare only the keys that are important for equality
    return compareKey.every((key) => a?.[key] === b?.[key]);
};
