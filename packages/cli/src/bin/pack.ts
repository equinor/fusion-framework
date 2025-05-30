import AdmZip from 'adm-zip';

import type { ReadResult as PackageInfo } from 'read-package-up';

import { dirname, resolve } from 'node:path';
import { mkdir, stat } from 'node:fs/promises';

import { formatByteSize, formatPath, chalk, type ConsoleLogger } from './utils';
import { fileExistsSync } from '../lib/utils';

/* Files to add to zip package */
const addFiles = ['package.json', 'LICENSE.md', 'README.md', 'CHANGELOG.md'];

/**
 * Options for packaging an application bundle into a zip archive.
 *
 * This type defines the optional parameters for the {@link pack} function, including
 * the build directory, archive output path, logger, and additional content to include.
 *
 * @property buildDir - Directory containing build output to include in the archive (default: 'dist').
 * @property archive - Path to the output archive file (optional).
 * @property log - Logger instance for outputting progress and debug information (optional).
 * @property content - Additional files to include in the archive as a record of filename to content.
 *
 * @public
 */
type Options = {
  buildDir?: string;
  archive?: string;
  log?: ConsoleLogger | null;
  content?: Record<string, string>;
};

/**
 * Packages an application build directory and additional files into a zip archive.
 *
 * This function validates the build directory, adds build output and standard files (e.g., package.json, README.md),
 * and optionally writes the archive to disk. It supports adding extra content and provides detailed logging.
 *
 * @param pkg - The resolved package info from package.json.
 * @param options - Packaging options including build directory, archive path, logger, and extra content.
 * @returns The AdmZip instance representing the created archive.
 * @throws If the build directory does not exist or writing the archive fails.
 * @public
 */
export const pack = async (pkg: PackageInfo, options?: Options): Promise<AdmZip> => {
  const { archive, log } = options ?? {};

  // Resolve the path to the package root and build directory
  const pkgPath = dirname(pkg.path);
  const buildDir = options?.buildDir ?? 'dist';
  const buildDirPath = resolve(pkgPath, buildDir);

  // Ensure the build directory exists and is a directory
  if (!(await stat(buildDirPath)).isDirectory()) {
    throw new Error(`Build directory ${buildDir} does not exist`);
  }

  log?.log(chalk.bold('Starting to pack bundle'));

  // Create a new zip archive
  const bundle = new AdmZip();

  // Add the build directory to the archive under its own folder
  bundle.addLocalFolder(buildDirPath, buildDir);

  // Add any additional content provided in options
  if (options?.content) {
    for (const [name, data] of Object.entries(options.content)) {
      bundle.addFile(name, Buffer.from(data));
      log?.info('📄', formatPath(name, { relative: true }));
    }
  }

  log?.info('📂', formatPath(buildDirPath, { relative: true }));

  // Add standard files and any files listed in package.json 'files' array
  for (const file of addFiles.concat(pkg.packageJson.files ?? [])) {
    const filePath = resolve(pkgPath, file);
    const fileDir = dirname(filePath.replace(pkgPath, ''));
    if (fileExistsSync(filePath)) {
      bundle.addLocalFile(filePath, fileDir);
      log?.info('📄', formatPath(filePath, { relative: true }));
    } else {
      log?.warn(chalk.dim('📄', formatPath(filePath, { relative: true })));
    }
  }

  // If an archive path is provided, write the zip file to disk
  if (archive) {
    // Ensure the output directory exists
    if (!fileExistsSync(dirname(archive))) {
      await mkdir(dirname(archive), { recursive: true });
    }

    log?.start('compressing content');
    await bundle.writeZipPromise(archive);
    log?.succeed('📚', formatPath(archive, { relative: true }), formatByteSize(archive));
  }

  // Return the AdmZip instance for further use or testing
  return bundle;
};

// Export as default for compatibility with import patterns
export default pack;
