import { describe, expect, it, vi } from 'vitest';

const { startAppDevServer } = vi.hoisted(() => ({ startAppDevServer: vi.fn() }));

vi.mock('@equinor/fusion-framework-cli/bin', async () => {
  const { resolveOctopusUrl } = await import('../../../bin/utils/resolve-octopus.js');
  return {
    startAppDevServer,
    resolveOctopusUrl,
    ConsoleLogger: class {
      start = vi.fn();
      succeed = vi.fn();
    },
  };
});

import { command } from './dev.command.js';

describe('app dev command', () => {
  it('maps --env to the runtime environment options', async () => {
    await command.parseAsync(['--env', 'review'], { from: 'user' });

    expect(startAppDevServer).toHaveBeenCalledWith(
      expect.objectContaining({ env: { environment: 'review' } }),
    );
  });

  it.each([
    [['--octopus'], 'http://localhost:2000'],
    [['--octopus', 'http://localhost:2100'], 'http://localhost:2100'],
  ])('passes the Octopus address for %j', async (args, octopus) => {
    startAppDevServer.mockClear();

    await command.parseAsync(args, { from: 'user' });

    expect(startAppDevServer).toHaveBeenCalledWith(expect.objectContaining({ octopus }));
  });
});
