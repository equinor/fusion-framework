import { normalizePath, type Plugin } from 'vite';

import { fileURLToPath } from 'node:url';

import defaultTemplate from './html/index.html.js';

import { objectToEnv } from './util/object-to-env.js';
import { loadEnvironment } from './util/load-env.js';

import type { TemplateEnv, TemplateEnvFn } from './types.js';

/**
 * Options accepted by the Fusion SPA Vite plugin.
 *
 * @remarks
 * Controls HTML template generation, environment variable prefixing,
 * and the factory that produces template environment values from the
 * current Vite build/serve context.
 *
 * @template TEnv - Shape of the template environment. Defaults to {@link TemplateEnv}.
 *
 * @example
 * ```ts
 * const opts: PluginOptions<FusionTemplateEnv> = {
 *   templateEnvPrefix: 'FUSION_SPA_',
 *   generateTemplateEnv: (env) => ({
 *     title: 'My App',
 *     portal: { id: 'my-portal' },
 *     serviceDiscovery: { url: '...', scopes: ['...'] },
 *     msal: { tenantId: '...', clientId: '...', redirectUri: '...' },
 *   }),
 * };
 * ```
 */
export type PluginOptions<TEnv extends TemplateEnv = TemplateEnv> = {
  /**
   * Custom HTML template string.
   *
   * @remarks
   * When omitted the plugin uses a built-in template that loads the
   * bootstrap script, sets the page title, and includes the Equinor font.
   */
  template?: string;

  /**
   * Prefix used when reading environment variables from `.env` files.
   *
   * @defaultValue `'FUSION_SPA_'`
   */
  templateEnvPrefix?: string;

  /**
   * Factory that returns partial environment values merged with defaults
   * and flattened into `{templateEnvPrefix}*` variables.
   *
   * @see {@link TemplateEnvFn}
   */
  generateTemplateEnv?: TemplateEnvFn<TEnv>;

  /**
   * Optional logger used for plugin diagnostics during Vite config
   * resolution.
   */
  logger?: Pick<Console, 'debug' | 'info' | 'warn' | 'error'>;
};

/**
 * Built-in defaults applied when no matching value is provided by
 * {@link PluginOptions.generateTemplateEnv} or `.env` files.
 */
const defaultEnv: Partial<TemplateEnv> = {
  title: 'Fusion SPA',
  bootstrap: '/@fusion-spa-bootstrap.js',
};

/**
 * Creates the Fusion SPA Vite plugin.
 *
 * @remarks
 * The plugin hooks into Vite's `config`, `resolveId`, and `configureServer`
 * lifecycle to:
 *
 * 1. Flatten {@link PluginOptions.generateTemplateEnv | template env} values
 *    and `.env` overrides into `import.meta.env.FUSION_SPA_*` defines.
 * 2. Resolve virtual module IDs (`/@fusion-spa-bootstrap.js`,
 *    `/@fusion-spa-sw.js`) to the package's pre-built HTML assets.
 * 3. Serve the SPA HTML template for every `text/html` GET request
 *    (SPA fallback).
 *
 * @template TEnv - Shape of the template environment.
 * @param options - Plugin configuration. See {@link PluginOptions}.
 * @returns A Vite {@link Plugin} instance named `fusion-framework-plugin-spa`.
 *
 * @example
 * ```ts
 * import { plugin as fusionSpaPlugin } from '@equinor/fusion-framework-vite-plugin-spa';
 *
 * export default defineConfig({
 *   plugins: [
 *     fusionSpaPlugin({
 *       generateTemplateEnv: () => ({
 *         title: 'My App',
 *         portal: { id: 'my-portal' },
 *       }),
 *     }),
 *   ],
 * });
 * ```
 */
export const plugin = <TEnv extends TemplateEnv = TemplateEnv>(
  options?: PluginOptions<TEnv>,
): Plugin => {
  // SPA index template
  const indexTemplate = options?.template ?? defaultTemplate;
  const log = options?.logger;

  return {
    name: 'fusion-framework-plugin-spa',
    resolveId: async (id) => {
      // resolve resource aliases to the correct path
      switch (id) {
        case '/@fusion-spa-bootstrap.js': {
          const file = await import.meta.resolve(
            '@equinor/fusion-framework-vite-plugin-spa/bootstrap.js',
          );
          return fileURLToPath(file);
        }
        case '/@fusion-spa-sw.js': {
          const file = await import.meta.resolve('@equinor/fusion-framework-vite-plugin-spa/sw.js');
          return fileURLToPath(file);
        }
      }
    },
    config: async (config, configEnv) => {
      const templateEnvPrefix = options?.templateEnvPrefix ?? 'FUSION_SPA_';
      // generate environment variables from plugin options
      const pluginEnvObj = { ...defaultEnv, ...options?.generateTemplateEnv?.(configEnv) };
      const pluginEnv = objectToEnv(pluginEnvObj ?? defaultEnv, templateEnvPrefix);

      log?.debug('plugin config environment\n', pluginEnv);

      // load environment variables from files
      const loadedEnv = loadEnvironment(config, configEnv, templateEnvPrefix);

      log?.debug('plugin loaded environment\n', pluginEnv);

      const env = { ...pluginEnv, ...loadedEnv };

      log?.debug('plugin environment\n', env);

      // define environment variables
      config.define ??= {};
      for (const [key, value] of Object.entries(env)) {
        // All values must be valid JavaScript expressions for Vite's config.define
        // Try to parse as JSON first (handles booleans, numbers, objects, arrays)
        // If that fails, stringify the raw value as a string literal
        try {
          const parsed = JSON.parse(String(value));
          // Re-stringify to ensure it's a valid JS expression
          config.define[`import.meta.env.${key}`] = JSON.stringify(parsed);
        } catch {
          // If JSON.parse fails, it's a plain string - wrap it as a JSON string for Vite
          config.define[`import.meta.env.${key}`] = JSON.stringify(String(value));
        }
      }

      config.server ??= {};
      config.server.fs ??= {};
      config.server.fs.allow ??= [];
      // allow access to the html directory

      const htmlDir = fileURLToPath(new URL('../html', import.meta.url));
      config.server.fs.allow.push(normalizePath(htmlDir));

      log?.info(`plugin configured for ${env.FUSION_SPA_PORTAL_ID}`);
    },
    configureServer(server) {
      // Apply SPA fallback
      server.middlewares.use(async (req, res, next) => {
        // Skip if this is not a GET request or the request is not for HTML
        if (!req.url || req.method !== 'GET' || !req.headers.accept?.includes('text/html')) {
          return next();
        }

        const html = await server.transformIndexHtml(req.url, indexTemplate, req.originalUrl);

        res.writeHead(200, {
          'content-type': 'text/html',
          'content-length': Buffer.byteLength(html),
          'cache-control': 'no-cache',
          ...server.config.server.headers,
        });

        return res.end(html);
      });
    },
  };
};

export default plugin;
