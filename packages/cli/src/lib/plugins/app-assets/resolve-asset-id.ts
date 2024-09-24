import fs from 'node:fs';
import path from 'node:path';

import { type PluginContext, type PartialResolvedId } from 'rollup';

import { PLUGIN_NAME } from './static.js';

/**
 * Try to resolve the assets directly based on the ID and importer.
 */
const localResolve = (id: string, importer: string): PartialResolvedId | null => {
    if (path.isAbsolute(id)) {
        return { id, external: 'absolute', resolvedBy: PLUGIN_NAME };
    } else if (id.startsWith('.')) {
        return {
            id: path.resolve(path.dirname(importer), id),
            external: 'relative',
            resolvedBy: PLUGIN_NAME,
        };
    }
    return null;
};

/**
 * Resolves the asset ID based on the provided context, ID, importer, and options.
 *
 * @param context - The plugin context used for resolving the ID.
 * @param id - The asset ID to resolve.
 * @param importer - The path of the module that is importing the asset.
 * @param options - Optional resolution options.
 * @returns A promise that resolves to a `PartialResolvedId` object or `null`.
 *
 * The function handles three cases:
 * 1. If the ID is an absolute path, it returns an object with the ID, marked as external and resolved by the plugin.
 * 2. If the ID is a relative path, it resolves the path relative to the importer and returns an object with the resolved ID, marked as external and resolved by the plugin.
 * 3. For all other cases, it delegates the resolution to the context's resolve method.
 */
export const resolveAssetId = async (
    context: PluginContext,
    id: string,
    importer: string,
    options?: Parameters<PluginContext['resolve']>[2],
): Promise<PartialResolvedId | null> => {
    const resolve = localResolve(id, importer);
    /**
     * Check if the asset can be resolved locally.
     * If the asset is found, return the resolved asset.
     *
     * @remarks
     * The Id alone might not be enough to resolve the asset.
     * Rollup only gives the ID as the import from the source.
     *
     * For example, if the import is `import svgData from './assets/image.svg';`,
     * the actual file is `./assets/image.svg.js`.
     *
     * In this we try to as the context to resolve the ID.
     */
    if (resolve && fs.existsSync(resolve.id)) {
        return resolve;
    }
    return await context.resolve(id, importer, options);
};
