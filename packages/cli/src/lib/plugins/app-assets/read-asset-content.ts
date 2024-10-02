import { existsSync, readFileSync } from 'node:fs';

/**
 * Cache for the content of assets.
 */
const assetsContentMap = new Map<string, Buffer>();

/**
 * Reads the content of an asset synchronously.
 *
 * @param id - The identifier of the asset, which can include a query string.
 * @returns The content of the asset as a Buffer if it exists, otherwise null.
 *
 * @remarks
 * - If the asset content is already cached, it returns the cached content.
 * - The function extracts the filename from the identifier by removing any query string.
 * - If the file exists, it reads the content, caches it, and then returns it.
 * - If the file does not exist, it logs a warning and returns null.
 */
export const readAssetContentSync = (id: string): Buffer | null => {
    // check if the asset is already loaded
    if (assetsContentMap.has(id)) {
        return assetsContentMap.get(id)!;
    }

    // extract the filename without query
    const [pureId] = id.split('?');

    // if the file exists, read, cache and return content
    if (existsSync(pureId)) {
        const content = readFileSync(pureId);
        assetsContentMap.set(id, content);
        return content;
    }

    return null;
};

export default readAssetContentSync;
