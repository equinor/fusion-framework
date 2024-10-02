import path from 'node:path';

import { type PluginContext } from 'rollup';
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
    const { outDir = 'dist', assetsDir = 'assets', name = '[name].[ext]' } = options;
    const [originalFileName, resourceQuery] = id.split('?');

    // read asset content, early return if not found
    const content = readAssetContentSync(id);
    if (!content || content.byteLength === 0) {
        throw new Error(`Could not read asset content for ${id}`);
    }

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

    // write asset to file
    context.emitFile({
        fileName,
        name: fullName,
        type: 'asset',
        source: content,
    });

    return assetPath;
};

export default emitAssetSync;
