import http from 'node:http';
import type { AddressInfo } from 'node:net';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { command } from './index.js';

/** Starts a stand-in for Octopus that answers every request with the given status and body. */
const startOctopusStandIn = (status: number, body = '') =>
  new Promise<{ url: string; close: () => Promise<void> }>((resolve) => {
    const server = http.createServer((_req, res) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(body);
    });
    server.listen(0, '127.0.0.1', () =>
      resolve({
        url: `http://localhost:${(server.address() as AddressInfo).port}`,
        close: () => new Promise((done) => server.close(() => done())),
      }),
    );
  });

describe('octopus command', () => {
  const stops: Array<() => Promise<void>> = [];
  let log: ReturnType<typeof vi.spyOn>;
  let error: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    log = vi.spyOn(console, 'log').mockImplementation(() => {});
    error = vi.spyOn(console, 'error').mockImplementation(() => {});
    // `process.exit` would end the test run; throwing stops the command the same way.
    vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`exit ${code}`);
    }) as never);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await Promise.all(stops.splice(0).map((stop) => stop()));
  });

  const run = async (status: number, body: string, args: string[]) => {
    const octopus = await startOctopusStandIn(status, body);
    stops.push(octopus.close);
    return command.parseAsync([...args, '--url', octopus.url], { from: 'user' });
  };

  describe('list', () => {
    it('lists nothing when no apps are registered', async () => {
      await run(200, '[]', ['list']);

      expect(log).toHaveBeenCalledWith('No apps registered.');
    });

    it.each([
      [500, '{"error":"failed"}'],
      [200, '{"not":"a list"}'],
      [200, '<html>another program</html>'],
    ])('exits with an error when Octopus answers %i %s', async (status, body) => {
      await expect(run(status, body, ['list'])).rejects.toThrow('exit 1');
      expect(error).toHaveBeenCalledWith(expect.stringContaining('without a list of apps'));
    });
  });

  describe('unregister', () => {
    it('reports an app it removed', async () => {
      await run(204, '', ['unregister', 'my-app']);

      expect(log).toHaveBeenCalledWith(expect.stringContaining('Unregistered my-app'));
    });

    it('reports an app that is not registered, without failing', async () => {
      await run(404, '', ['unregister', 'my-app']);

      expect(log).toHaveBeenCalledWith('my-app is not registered.');
      expect(process.exit).not.toHaveBeenCalled();
    });

    it.each([400, 500])('exits with an error when Octopus answers %i', async (status) => {
      await expect(run(status, '{"error":"failed"}', ['unregister', 'my-app'])).rejects.toThrow(
        'exit 1',
      );
      expect(error).toHaveBeenCalledWith(expect.stringContaining(`answered ${status}`));
    });
  });
});
