import { createServer } from 'vite';
import createDevServerConfig from './create-dev-server-config';

import type { DevServerOptions } from './types';

/**
 * Asynchronously creates and configures a development server instance.
 *
 * @param options - The options used to configure the development server.
 * @returns A promise that resolves to the created development server instance.
 */
export const createDevServer = async (options: DevServerOptions) => {
  const config = createDevServerConfig(options);
  const server = await createServer(config);
  return server;
};

export default createDevServer;
