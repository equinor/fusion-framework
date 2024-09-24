import { createFilter, type ResolvedConfig, type FilterPattern, type Plugin } from 'vite';

import { emitAssetSync } from './emit-asset.js';
import { resolveAssetId } from './resolve-asset-id.js';
import { createExtensionFilterPattern } from './extension-filter-pattern.js';

import { ASSET_EXTENSIONS, PLUGIN_NAME } from './static.js';

const defaultInclude = createExtensionFilterPattern(ASSET_EXTENSIONS);

/**
 * A Vite plugin to handle external resources in a library build.
 *
 * @param options - Configuration options for the plugin.
 * @param options.name - Optional name for the emitted assets.
 * @param options.include - Filter pattern to include specific files.
 * @param options.exclude - Filter pattern to exclude specific files.
 * @returns A Vite plugin object.
 *
 * @remarks
 * This plugin is intended to be used only during the Vite library build process.
 * It resolves asset IDs, emits assets, and exports them as URLs.
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { ExternalAppAssetPlugin } from '@equinor/fusion-framework-cli/plugins/app-assets-plugin';
 *
 * export default {
 *   plugins: [
 *     ExternalAppAssetPlugin({
 *       name: 'my-asset',
 *       include:  ['svg', 'png'],
 *       exclude: 'node_modules/**',
 *     }),
 *   ],
 * };
 * ```
 */
export const AppAssetExportPlugin = (
    options: {
        name?: string;
        include?: FilterPattern;
        exclude?: FilterPattern;
    } = {},
): Plugin => {
    const { name, include = defaultInclude, exclude } = options;

    let viteConfig: ResolvedConfig;

    const assetsPathMap = new Map<string, string | null>();

    const filter = createFilter(include, exclude);

    return {
        name: PLUGIN_NAME,
        enforce: 'pre',
        apply: 'build',
        configResolved(config) {
            viteConfig = config;
        },
        async resolveId(source, importer = '', opts) {
            if (!viteConfig.build.lib) {
                this.warn(`this plugin is only for vite build lib`);
            }
            // skip resolves triggered by plugin self or filter mismatch
            if (opts.custom?.caller === PLUGIN_NAME || !filter(source)) {
                return null;
            }

            const assetId = await resolveAssetId(this, source, importer, {
                ...opts,
                custom: {
                    ...opts.custom,
                    caller: PLUGIN_NAME,
                },
            });

            const { id } = assetId ?? {};

            if (id) {
                const { outDir, assetsDir } = viteConfig.build;
                const assetPath = emitAssetSync(this, id, {
                    name,
                    outDir,
                    assetsDir,
                });
                assetsPathMap.set(id, assetPath!);
            }

            return id;
        },
        load(id) {
            // lookup asset path and export as URL
            const assetPath = assetsPathMap.get(id);
            if (assetPath) {
                // ensure asset path is relative from the script load path
                return `export default new URL(/* @vite-ignore */'${assetPath}', import.meta.url).href`;
            }
        },
    };
};

export default AppAssetExportPlugin;
