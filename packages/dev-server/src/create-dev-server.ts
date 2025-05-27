import { createServer, type UserConfig } from 'vite';
import createDevServerConfig from './create-dev-server-config.js';

import type { DevServerOptions } from './types.js';

/**
 * Asynchronously creates and configures a development server instance.
 *
 * @param options - The options used to configure the development server.
 * @returns A promise that resolves to the created development server instance.
 */
export const createDevServer = async (options: DevServerOptions, overrides?: UserConfig) => {
  const config = createDevServerConfig(options, overrides);
  const server = await createServer(config);
  return server;
};

export default createDevServer;
