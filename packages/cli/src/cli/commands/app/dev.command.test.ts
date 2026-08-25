import { describe, expect, it, vi } from 'vitest';

const { startAppDevServer } = vi.hoisted(() => ({ startAppDevServer: vi.fn() }));

vi.mock('@equinor/fusion-framework-cli/bin', () => ({
  startAppDevServer,
  ConsoleLogger: class {
    start = vi.fn();
    succeed = vi.fn();
  },
}));

import { command } from './dev.command.js';

describe('app dev command', () => {
  it('maps --env to the runtime environment options', async () => {
    await command.parseAsync(['--env', 'review'], { from: 'user' });

    expect(startAppDevServer).toHaveBeenCalledWith(
      expect.objectContaining({ env: { environment: 'review' } }),
    );
  });
});
