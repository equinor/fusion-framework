import { loadEnv, type ConfigEnv, type Plugin } from 'vite';

import defaultTemplate from './html/index.html.js';

import { objectToEnv } from './util/object-to-env.js';
import { loadEnvironment } from './util/load-env.js';

import type { TemplateEnv, TemplateEnvFn } from './types.js';

/**
 * Represents the options for configuring a plugin.
 *
 * @template TEnv - The type of the template environment. Defaults to `TemplateEnv`.
 *
 * @property {string} [template] - The path to the template file to be used.
 * @property {string} [templateEnvPrefix] - A prefix to filter environment variables for the template.
 * @property generateTemplateEnv -
 *    A function to generate the template environment. It receives the configuration environment and
 *    a partial template environment as arguments, and returns a modified or extended partial template environment.
 */
export type PluginOptions<TEnv extends TemplateEnv = TemplateEnv> = {
  template?: string;
  templateEnvPrefix?: string;
  generateTemplateEnv?: TemplateEnvFn<TEnv>;
  logger?: Pick<Console, 'debug' | 'info' | 'warn' | 'error'>;
};

/**
 * Represents the default environment configuration for the Fusion SPA.
 */
const defaultEnv: Partial<TemplateEnv> = {
  title: 'Fusion SPA',
  bootstrap: '/@fusion-spa-bootstrap.js',
};

export const plugin = <TEnv extends TemplateEnv = TemplateEnv>(
  options?: PluginOptions<TEnv>,
): Plugin => {
  // SPA index template
  const indexTemplate = options?.template ?? defaultTemplate;
  const log = options?.logger;

  return {
    name: 'fusion-framework-plugin-spa',
    resolveId(id) {
      // resolve resource aliases to the correct path
      switch (id) {
        case '/@fusion-spa-bootstrap.js':
          return new URL('./html/bootstrap.js', import.meta.url).pathname;
        case '/@fusion-spa-sw.js':
          return new URL('./html/sw.js', import.meta.url).pathname;
      }
    },
    config(config, configEnv) {
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
        config.define[`import.meta.env.${key}`] = value;
      }
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
