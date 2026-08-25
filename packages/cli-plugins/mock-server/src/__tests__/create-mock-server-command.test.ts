import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  close: vi.fn().mockResolvedValue(undefined),
  createMockServer: vi.fn(),
  discoverServices: vi.fn(),
  loadMockServerConfig: vi.fn(),
  start: vi.fn(),
  use: vi.fn(),
}));

vi.mock('@equinor/fusion-openapi-mock-server', () => ({
  createMockServer: mocks.createMockServer,
}));

vi.mock('@equinor/fusion-openapi-mock-server/discovery', () => ({
  discoverServices: mocks.discoverServices,
}));

vi.mock('../load-mock-server-config.js', () => ({
  loadMockServerConfig: mocks.loadMockServerConfig,
}));

import { createMockServerCommand } from '../create-mock-server-command.js';

describe('createMockServerCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(process, 'on').mockReturnValue(process);
    mocks.createMockServer.mockReturnValue({
      close: mocks.close,
      start: mocks.start,
      use: mocks.use,
    });
    mocks.discoverServices.mockResolvedValue([]);
    mocks.start.mockResolvedValue({ url: 'http://localhost:4010' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses project config before plugin defaults', async () => {
    mocks.loadMockServerConfig.mockResolvedValue({
      path: 'config-mocks',
      port: 4010,
      host: '127.0.0.1',
      seed: 42,
    });

    const command = createMockServerCommand({
      path: 'plugin-mocks',
      port: 4020,
      host: 'localhost',
      seed: 7,
    });
    await command.parseAsync(['node', 'test']);

    expect(mocks.discoverServices).toHaveBeenCalledWith('config-mocks');
    expect(mocks.createMockServer).toHaveBeenCalledWith({ seed: 42 });
    expect(mocks.start).toHaveBeenCalledWith({ port: 4010, host: '127.0.0.1' });
  });

  it('uses explicit arguments and flags before project config', async () => {
    mocks.loadMockServerConfig.mockResolvedValue({
      path: 'config-mocks',
      port: 4010,
      host: '127.0.0.1',
      seed: 42,
    });

    const command = createMockServerCommand();
    await command.parseAsync([
      'node',
      'test',
      'cli-mocks',
      '--port=5000',
      '--host=0.0.0.0',
      '--seed=99',
    ]);

    expect(mocks.discoverServices).toHaveBeenCalledWith('cli-mocks');
    expect(mocks.createMockServer).toHaveBeenCalledWith({ seed: 99 });
    expect(mocks.start).toHaveBeenCalledWith({ port: 5000, host: '0.0.0.0' });
  });

  it('uses plugin defaults before built-in conventions', async () => {
    mocks.loadMockServerConfig.mockResolvedValue({});

    const command = createMockServerCommand({
      path: 'plugin-mocks',
      port: 4020,
      host: '127.0.0.1',
      seed: 7,
    });
    await command.parseAsync(['node', 'test']);

    expect(mocks.discoverServices).toHaveBeenCalledWith('plugin-mocks');
    expect(mocks.createMockServer).toHaveBeenCalledWith({ seed: 7 });
    expect(mocks.start).toHaveBeenCalledWith({ port: 4020, host: '127.0.0.1' });
  });

  it('uses built-in conventions when no other values are provided', async () => {
    mocks.loadMockServerConfig.mockResolvedValue({});

    const command = createMockServerCommand();
    await command.parseAsync(['node', 'test']);

    expect(mocks.discoverServices).toHaveBeenCalledWith('mocks');
    expect(mocks.createMockServer).toHaveBeenCalledWith({ seed: undefined });
    expect(mocks.start).toHaveBeenCalledWith({ port: undefined, host: 'localhost' });
  });
});
