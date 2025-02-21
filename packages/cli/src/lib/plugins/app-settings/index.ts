import type { Plugin } from 'vite';

import parseJsonFromRequest from '../../utils/parse-json-request.js';

/**
 * Options for configuring the AppSettingsPlugin.
 */
export interface AppSettingsPluginOptions {
  /**
   * A string or regular expression to match specific settings.
   * If provided, only settings that match this pattern will be considered.
   */
  match?: string | RegExp;

  /**
   * A record of default settings to be used if no other settings are provided.
   * The keys are setting names and the values are the default values for those settings.
   */
  defaultSettings?: Record<string, unknown>;
}

/**
 * This plugin provides a simple way to manage application settings in a local development environment.
 *
 * This plugin will cache the settings in memory and respond to `PUT` requests to update the settings.
 * Restarting the development server will reset the settings to the default values.
 *
 * @param options - The options for configuring the app settings plugin.
 * @returns A Vite Plugin object that can be used to configure a server.
 *
 * The plugin provides the following functionality:
 * - Matches requests based on a specified path pattern.
 * - Handles `PUT` requests to update application settings.
 * - Responds with the current application settings in JSON format.
 */
export function appSettingsPlugin(options: AppSettingsPluginOptions): Plugin {
  let appSettings = options.defaultSettings ?? {};
  const pathMatch = new RegExp(options.match ?? '/persons/me/apps/.*/settings');
  return {
    name: 'app-settings',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.match(pathMatch)) {
          return next();
        }

        if (req.method === 'PUT') {
          appSettings = await parseJsonFromRequest(req);
        }

        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify(appSettings));
      });
    },
  };
}

export default appSettingsPlugin;
