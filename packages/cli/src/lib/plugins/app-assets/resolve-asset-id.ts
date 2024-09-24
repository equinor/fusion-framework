import path from 'node:path';

import { type PluginContext, type PartialResolvedId } from 'rollup';

import { PLUGIN_NAME } from './static.js';

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
    if (path.isAbsolute(id)) {
        return { id, external: 'absolute', resolvedBy: PLUGIN_NAME };
    } else if (id.startsWith('.')) {
        return {
            id: path.resolve(path.dirname(importer), id),
            external: 'relative',
            resolvedBy: PLUGIN_NAME,
        };
    }
    return await context.resolve(id, importer, options);
};
