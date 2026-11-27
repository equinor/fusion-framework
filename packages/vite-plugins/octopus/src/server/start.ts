import type { Server } from 'node:http';

import { Registry } from './registry.js';
import { createOctopusServer, type RegistryEvent, startHealthChecks } from './server.js';

/**
 * Describes a registry change as one log line.
 *
 * @param event - Registry change.
 * @returns The log line.
 */
export const describeEvent = (event: RegistryEvent): string => {
  const { app } = event;
  const mock = app.mockUrl ? ` (mock ${app.mockUrl})` : '';
  switch (event.type) {
    case 'registered':
      return `+ ${app.appKey}  ${app.url}${mock}`;
    case 'replaced':
      return `~ ${app.appKey}  ${app.url}${mock}  (replaces ${event.previous.url})`;
    case 'unregistered':
      return `- ${app.appKey}  unregistered`;
    case 'expired':
      return `- ${app.appKey}  no heartbeat, removed`;
    case 'unreachable':
      return `- ${app.appKey}  ${app.url} stopped responding, removed`;
  }
};

/** A running Octopus. */
export interface RunningOctopus {
  server: Server;
  /** Stops Octopus. */
  close(): Promise<void>;
}

/**
 * Starts Octopus: the registry, its health checks and the HTTP server.
 *
 * @param port - Port to listen on.
 * @param log - Writes registry changes.
 * @param host - Loopback address to listen on: `127.0.0.1` (the default) or `::1`.
 * @returns The running Octopus; rejects when the port is taken.
 */
export const startOctopus = async (
  port: number,
  log: (line: string) => void,
  host: '127.0.0.1' | '::1' = '127.0.0.1',
): Promise<RunningOctopus> => {
  const registry = new Registry();
  const onEvent = (event: RegistryEvent) =>
    log(`${new Date().toLocaleTimeString()}  ${describeEvent(event)}`);
  const server = createOctopusServer({ registry, onEvent });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    // Loopback only: Octopus proxies to local dev servers and must not be reachable from the network.
    server.listen(port, host, () => resolve());
  });
  const stopHealthChecks = startHealthChecks({ registry, onEvent });

  return {
    server,
    close: () =>
      new Promise((resolve) => {
        stopHealthChecks();
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
};
