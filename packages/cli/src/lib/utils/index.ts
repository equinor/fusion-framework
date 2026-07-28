/**
 * Shared utility functions for the Fusion Framework CLI.
 *
 * Includes assertion helpers, file-system utilities, package resolution,
 * annotation resolvers, and snapshot version generation.
 *
 * @packageDocumentation
 */
export { assert } from './assert.js';
export { resolveEntryPoint } from './resolve-source-entry-point-impl.js';
export { resolvePackage, type ResolvedPackage } from './resolve-package.js';
export { fileExistsSync } from './file-exists-sync.js';
export { fileExists } from './file-exists.js';
export { writeFile } from './write-file.js';
export { resolveAnnotations } from './resolve-annotations.js';
export { generateSnapshotVersion } from './generate-snapshot-version.js';
