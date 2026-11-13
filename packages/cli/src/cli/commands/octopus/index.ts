import { createCommand } from 'commander';

import {
  DEFAULT_OCTOPUS_URL,
  type RegisteredApp,
  startOctopus,
} from '@equinor/fusion-framework-vite-plugin-octopus/server';

const DEFAULT_PORT = new URL(DEFAULT_OCTOPUS_URL).port;

/** Octopus address for `list` and `unregister`: `--url`, or the default. */
const resolveUrl = (url?: string): string => url?.replace(/\/$/, '') ?? DEFAULT_OCTOPUS_URL;

/** Explains a failed request to Octopus, and exits. */
const fail = (url: string, error: unknown): never => {
  const code = (error as { cause?: { code?: string } }).cause?.code;
  console.error(
    code === 'ECONNREFUSED'
      ? `Octopus is not running at ${url}. Start it with: ffc octopus`
      : (error as Error).message,
  );
  process.exit(1);
};

const startCommand = createCommand('start')
  .description('Start Octopus (default command)')
  .option('--port <port>', 'Port to listen on', DEFAULT_PORT)
  .action(async (options: { port: string }) => {
    const port = Number(options.port);
    const octopus = await startOctopus(port, (line) => console.log(line));

    console.log(`🐙 Octopus is running at http://localhost:${port}`);
    console.log(
      'Apps register here when started with "ffc app dev --octopus". Waiting for apps…\n',
    );

    const shutdown = () => void octopus.close().then(() => process.exit(0));
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  });

const listCommand = createCommand('list')
  .description('List registered apps')
  .option('--url <url>', `Octopus address (default: ${DEFAULT_OCTOPUS_URL})`)
  .action(async (options: { url?: string }) => {
    const url = resolveUrl(options.url);
    const apps = await fetch(`${url}/api/apps`)
      .then((response) => response.json() as Promise<RegisteredApp[]>)
      .catch((error) => fail(url, error));

    if (apps.length === 0) {
      console.log('No apps registered.');
      return;
    }
    const width = Math.max(...apps.map(({ appKey }) => appKey.length));
    for (const app of apps) {
      const page = `${app.url}/apps/${encodeURIComponent(app.appKey)}`;
      const mock = app.mockUrl ? `  mock ${app.mockUrl}` : '';
      const seen = Math.round((Date.now() - app.lastSeen) / 1000);
      console.log(`${app.appKey.padEnd(width)}  ${page}${mock}  (heartbeat ${seen} s ago)`);
    }
  });

const unregisterCommand = createCommand('unregister')
  .description('Remove a registered app; it stays removed until its dev server or Octopus restarts')
  .argument('<appKey>', 'App to remove')
  .option('--url <url>', `Octopus address (default: ${DEFAULT_OCTOPUS_URL})`)
  .action(async (appKey: string, options: { url?: string }) => {
    const url = resolveUrl(options.url);
    const response = await fetch(`${url}/api/apps/${encodeURIComponent(appKey)}`, {
      method: 'DELETE',
    }).catch((error) => fail(url, error));

    console.log(
      response.ok
        ? `Unregistered ${appKey}. It stays unregistered until its dev server or Octopus restarts.`
        : `${appKey} is not registered.`,
    );
  });

/**
 * CLI command: `octopus`
 *
 * Octopus is a local registry and proxy for portal development. Apps started with
 * `ffc app dev --octopus` register where they run, and a portal started with
 * `ffc portal dev --octopus` loads them from there, and every other app from CI.
 *
 * `ffc portal dev --octopus` starts Octopus when it is not running, so this command is only
 * needed to run Octopus on its own, or to inspect it.
 *
 * Usage:
 *   $ ffc octopus [start] [--port 2000]
 *   $ ffc octopus list
 *   $ ffc octopus unregister <appKey>
 *
 * Open http://localhost:2000 for a page listing the registered apps.
 */
export const command = createCommand('octopus')
  .description('Local app registry and proxy for portal development')
  .addHelpText(
    'after',
    [
      '',
      'Apps started with "ffc app dev --octopus" register with Octopus, and a portal started with',
      '"ffc portal dev --octopus" loads them from their dev server, and every other app from CI.',
      'The portal starts Octopus when it is not running. Open http://localhost:2000 to see the',
      'registered apps.',
      '',
      'Examples:',
      '  $ ffc octopus',
      '  $ ffc octopus --port 2100',
      '  $ ffc octopus list',
      '  $ ffc octopus unregister my-app',
    ].join('\n'),
  )
  .addCommand(startCommand, { isDefault: true })
  .addCommand(listCommand)
  .addCommand(unregisterCommand);

export default command;
