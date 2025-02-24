import path from 'node:path';

import type { PluginContext } from 'rollup';
import { interpolateName } from 'loader-utils';

import { readAssetContentSync } from './read-asset-content.js';

type LoaderContext = Parameters<typeof interpolateName>[0];

/**
 * Synchronously emits an asset file based on the provided context and options.
 *
 * @param context - The plugin context used for emitting the file and logging warnings.
 * @param id - The identifier of the asset, which may include a resource query.
 * @param options - Optional parameters for customizing the emitted asset.
 * @param options.name - The name template for the emitted asset file. Defaults to '[name].[ext]'.
 * @param options.outDir - The output directory where the asset will be emitted. Defaults to 'dist'.
 * @param options.assetsDir - The directory within the output directory where assets will be stored. Defaults to 'assets'.
 * @returns The path of the emitted asset relative to the assets directory, or null if the asset content could not be read.
 */
export const emitAssetSync = (
  context: PluginContext,
  id: string,
  options: {
    name?: string;
    outDir?: string;
    assetsDir?: string;
  } = {},
): string | null => {
  // extract options and set defaults
  const { outDir = 'dist', assetsDir = 'assets', name = '[name].[ext]' } = options;

  // extract original file name and resource query
  const [originalFileName, resourceQuery] = id.split('?');

  // read asset content, throw error if content is empty
  const content = readAssetContentSync(id);
  if (!content || content.byteLength === 0) {
    throw new Error(`Could not read asset content for ${id}`);
  }

  // convert content to Uint8Array
  const source = new Uint8Array(content);

  // generate asset file name
  const url = interpolateName(
    {
      resourcePath: originalFileName,
      resourceQuery,
    } as LoaderContext,
    name,
    { content },
  );

  const assetPath = path.posix.join(assetsDir, url);
  const fileName = assetPath.replace(`?${resourceQuery}`, '');
  const fullName = path.join(path.isAbsolute(outDir) ? process.cwd() : '', outDir, assetPath);

  // emit asset file to output directory
  context.emitFile({
    fileName,
    name: fullName,
    type: 'asset',
    source,
  });

  // return the path of the emitted asset relative to the assets directory
  return assetPath;
};

export default emitAssetSync;
