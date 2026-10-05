import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  close: vi.fn().mockResolvedValue(undefined),
  createMockServer: vi.fn(),
  defineHelpArticlesMock: vi.fn((options: { dir: string }) => ({ key: 'help', ...options })),
  defineAnalyticsMock: vi.fn(),
  defineAppFeatureEventsMock: vi.fn(() => ({ key: 'apps', serviceDiscovery: 'merge' })),
  ensureGitIgnoredDir: vi.fn(),
  resolveAnalytics: vi.fn(),
  storeReady: vi.fn(),
  resolveHelpDocs: vi.fn(),
  discoverServices: vi.fn(),
  loadMockServerConfig: vi.fn(),
  start: vi.fn(),
  use: vi.fn(),
}));

vi.mock('@equinor/fusion-openapi-mock-server', () => ({
  createMockServer: mocks.createMockServer,
}));

// Keep the real merge so layering assertions match startup; only directory discovery is faked.
vi.mock('@equinor/fusion-openapi-mock-server/discovery', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@equinor/fusion-openapi-mock-server/discovery')>()),
  discoverServices: mocks.discoverServices,
}));

vi.mock('@equinor/fusion-openapi-mock-server/presets/fusion', () => ({
  defineHelpArticlesMock: mocks.defineHelpArticlesMock,
  defineAnalyticsMock: mocks.defineAnalyticsMock,
  defineAppFeatureEventsMock: mocks.defineAppFeatureEventsMock,
}));

vi.mock('../analytics/index.js', () => ({
  ensureGitIgnoredDir: mocks.ensureGitIgnoredDir,
  resolveAnalytics: mocks.resolveAnalytics,
}));

vi.mock('../resolve-help-docs.js', () => ({
  resolveHelpDocs: mocks.resolveHelpDocs,
}));

vi.mock('../load-mock-server-config.js', () => ({
  loadMockServerConfig: mocks.loadMockServerConfig,
}));

import {
  mergeServiceDefinitions,
  type ServiceMockDefinition,
} from '@equinor/fusion-openapi-mock-server/discovery';

import { createMockServerCommand } from '../create-mock-server-command.js';

/** Minimal OpenAPI document for complete definitions passed through the real merge. */
const SCHEMA = { openapi: '3.0.0', info: { title: 'Help', version: '1.0.0' }, paths: {} };

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
    mocks.resolveHelpDocs.mockResolvedValue(undefined);
    mocks.start.mockResolvedValue({ url: 'http://localhost:4010' });
    // Analytics are off unless a test turns them on, so layering assertions stay focused.
    mocks.resolveAnalytics.mockReturnValue(undefined);
    mocks.storeReady.mockResolvedValue(undefined);
    mocks.defineAnalyticsMock.mockImplementation((options: { record?: string }) => ({
      key: 'monitor',
      store: {
        ready: mocks.storeReady,
        recordFile: options.record,
        getRecords: () => [{}, {}],
      },
    }));
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
      allowedOrigins: ['http://localhost:3000'],
    });

    const command = createMockServerCommand({
      path: 'plugin-mocks',
      port: 4020,
      host: 'localhost',
      seed: 7,
      allowedOrigins: ['http://localhost:3020'],
    });
    await command.parseAsync(['node', 'test']);

    expect(mocks.discoverServices).toHaveBeenCalledWith('config-mocks');
    expect(mocks.createMockServer).toHaveBeenCalledWith({
      seed: 42,
      allowedOrigins: ['http://localhost:3000'],
    });
    expect(mocks.start).toHaveBeenCalledWith({ port: 4010, host: '127.0.0.1' });
  });

  it('uses explicit arguments and flags before project config', async () => {
    mocks.loadMockServerConfig.mockResolvedValue({
      path: 'config-mocks',
      port: 4010,
      host: '127.0.0.1',
      seed: 42,
      allowedOrigins: ['http://localhost:3000'],
    });

    const command = createMockServerCommand();
    await command.parseAsync([
      'node',
      'test',
      'cli-mocks',
      '--port=5000',
      '--host=0.0.0.0',
      '--seed=99',
      '--allow-origin=http://localhost:5001',
      '--allow-origin=http://localhost:5002',
    ]);

    expect(mocks.discoverServices).toHaveBeenCalledWith('cli-mocks');
    expect(mocks.createMockServer).toHaveBeenCalledWith({
      seed: 99,
      allowedOrigins: ['http://localhost:5001', 'http://localhost:5002'],
    });
    expect(mocks.start).toHaveBeenCalledWith({ port: 5000, host: '0.0.0.0' });
  });

  it('uses plugin defaults before built-in conventions', async () => {
    mocks.loadMockServerConfig.mockResolvedValue({});

    const command = createMockServerCommand({
      path: 'plugin-mocks',
      port: 4020,
      host: '127.0.0.1',
      seed: 7,
      allowedOrigins: ['http://localhost:4021'],
    });
    await command.parseAsync(['node', 'test']);

    expect(mocks.discoverServices).toHaveBeenCalledWith('plugin-mocks');
    expect(mocks.createMockServer).toHaveBeenCalledWith({
      seed: 7,
      allowedOrigins: ['http://localhost:4021'],
    });
    expect(mocks.start).toHaveBeenCalledWith({ port: 4020, host: '127.0.0.1' });
  });

  it('uses built-in conventions when no other values are provided', async () => {
    mocks.loadMockServerConfig.mockResolvedValue({});

    const command = createMockServerCommand();
    await command.parseAsync(['node', 'test']);

    expect(mocks.discoverServices).toHaveBeenCalledWith('mocks');
    expect(mocks.createMockServer).toHaveBeenCalledWith({
      seed: undefined,
      allowedOrigins: undefined,
    });
    expect(mocks.start).toHaveBeenCalledWith({ port: 4010, host: 'localhost' });
  });

  describe('help docs', () => {
    const cwd = process.cwd();

    it('passes the flag, config, and plugin default to the resolver in that order', async () => {
      mocks.loadMockServerConfig.mockResolvedValue({ helpDocs: 'config-docs' });

      const command = createMockServerCommand({ helpDocs: 'plugin-docs' });
      await command.parseAsync(['node', 'test', '--help-docs', 'flag-docs']);

      expect(mocks.resolveHelpDocs).toHaveBeenCalledWith(cwd, {
        option: 'flag-docs',
        config: 'config-docs',
        defaults: 'plugin-docs',
      });
    });

    it('maps --no-help-docs to an explicit opt-out', async () => {
      mocks.loadMockServerConfig.mockResolvedValue({});

      const command = createMockServerCommand();
      await command.parseAsync(['node', 'test', '--no-help-docs']);

      expect(mocks.resolveHelpDocs).toHaveBeenCalledWith(cwd, {
        option: false,
        config: undefined,
        defaults: undefined,
      });
    });

    it('layers resolved help docs after presets and before mock directories', async () => {
      mocks.loadMockServerConfig.mockResolvedValue({});
      mocks.discoverServices.mockResolvedValue([{ key: 'my-api' }]);
      mocks.resolveHelpDocs.mockResolvedValue({
        dir: '/app/docs',
        articleCount: 2,
        faqCount: 1,
        source: 'detected',
      });
      const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

      const command = createMockServerCommand();
      await command.parseAsync(['node', 'test']);

      expect(mocks.use.mock.calls).toEqual([
        ['fusion'],
        [[{ key: 'help', dir: '/app/docs' }]],
        [[{ key: 'my-api' }]],
      ]);
      expect(log).toHaveBeenCalledWith(
        expect.stringMatching(
          /serving 2 help article\(s\) and 1 FAQ\(s\) from .*docs \(detected\)/,
        ),
      );
    });

    it('adds no help service when no help docs resolve', async () => {
      mocks.loadMockServerConfig.mockResolvedValue({});

      const command = createMockServerCommand();
      await command.parseAsync(['node', 'test']);

      expect(mocks.defineHelpArticlesMock).not.toHaveBeenCalled();
      expect(mocks.use.mock.calls).toEqual([['fusion'], [[]]]);
    });

    it('skips auto-detected help docs when a local mock already defines help', async () => {
      mocks.loadMockServerConfig.mockResolvedValue({});
      mocks.discoverServices.mockResolvedValue([{ key: 'help' }]);
      mocks.resolveHelpDocs.mockResolvedValue({
        dir: '/app/docs',
        articleCount: 1,
        faqCount: 0,
        source: 'detected',
      });
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

      const command = createMockServerCommand();
      await command.parseAsync(['node', 'test']);

      expect(mocks.defineHelpArticlesMock).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
    });

    it('skips configured help docs with a warning when a local mock defines help', async () => {
      mocks.loadMockServerConfig.mockResolvedValue({ helpDocs: 'docs' });
      mocks.discoverServices.mockResolvedValue([{ key: 'help', serviceDiscovery: 'new' }]);
      mocks.resolveHelpDocs.mockResolvedValue({
        dir: `${process.cwd()}/docs`,
        articleCount: 1,
        faqCount: 0,
        source: 'config',
      });
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

      const command = createMockServerCommand();
      await command.parseAsync(['node', 'test']);

      expect(mocks.defineHelpArticlesMock).not.toHaveBeenCalled();
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('not serving help docs from docs'));
    });

    it('keeps the docs baseline for a merge layer that a later replacement overrides', async () => {
      mocks.loadMockServerConfig.mockResolvedValue({ helpDocs: 'docs' });
      mocks.discoverServices
        .mockResolvedValueOnce([{ key: 'help', serviceDiscovery: 'merge' }])
        .mockResolvedValueOnce([{ key: 'help', serviceDiscovery: 'replace' }]);
      mocks.resolveHelpDocs.mockResolvedValue({
        dir: `${process.cwd()}/docs`,
        articleCount: 1,
        faqCount: 0,
        source: 'config',
      });
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

      const command = createMockServerCommand();
      await command.parseAsync(['node', 'test', 'merge-mocks', 'replace-mocks']);

      // Feed the registered layers through the real merge, as the server does at startup.
      const layers = mocks.use.mock.calls
        .map(([source]) => source)
        // Presets are registered by name; only definition groups take part in the merge.
        .filter((source): source is ServiceMockDefinition[] => Array.isArray(source))
        // Complete definitions need a schema, which the mocked factories omit.
        .map((group) => group.map((definition) => ({ document: SCHEMA, ...definition })));
      const help = mergeServiceDefinitions(...layers).find(
        (definition) => definition.key === 'help',
      );

      expect(mocks.defineHelpArticlesMock).toHaveBeenCalledWith({ dir: `${process.cwd()}/docs` });
      expect(help?.serviceDiscovery).toBe('replace');
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('not serving help docs from docs'));
      expect(log).not.toHaveBeenCalledWith(expect.stringContaining('help article(s)'));
    });

    it('keeps help docs under a local merge layer for the help service', async () => {
      mocks.loadMockServerConfig.mockResolvedValue({});
      mocks.discoverServices.mockResolvedValue([{ key: 'help', serviceDiscovery: 'merge' }]);
      mocks.resolveHelpDocs.mockResolvedValue({
        dir: '/app/docs',
        articleCount: 1,
        faqCount: 0,
        source: 'detected',
      });
      vi.spyOn(console, 'log').mockImplementation(() => undefined);

      const command = createMockServerCommand();
      await command.parseAsync(['node', 'test']);

      expect(mocks.use.mock.calls).toEqual([
        ['fusion'],
        [[{ key: 'help', dir: '/app/docs' }]],
        [[{ key: 'help', serviceDiscovery: 'merge' }]],
      ]);
    });

    it('fails startup when the resolver rejects a configured folder', async () => {
      mocks.loadMockServerConfig.mockResolvedValue({ helpDocs: 'missing' });
      mocks.resolveHelpDocs.mockRejectedValue(
        new Error('Help docs folder "missing" does not exist'),
      );

      const command = createMockServerCommand();

      await expect(command.parseAsync(['node', 'test'])).rejects.toThrow(/does not exist/);
      expect(mocks.start).not.toHaveBeenCalled();
    });
  });
  describe('analytics', () => {
    const resolved = {
      record: '/app/.fusion-mock/analytics.jsonl',
      defaultRecord: true,
      seed: ['/app/recordings'],
    };

    it('passes the flags, config, and plugin default to the resolver', async () => {
      mocks.loadMockServerConfig.mockResolvedValue({ analytics: { record: 'config.jsonl' } });

      const command = createMockServerCommand({ analytics: false });
      await command.parseAsync([
        'node',
        'test',
        '--analytics-record',
        'flag.jsonl',
        '--analytics-seed',
        'a',
        '--analytics-seed',
        'b',
      ]);

      expect(mocks.resolveAnalytics).toHaveBeenCalledWith(process.cwd(), {
        enabled: true,
        record: 'flag.jsonl',
        seed: ['a', 'b'],
        config: { record: 'config.jsonl' },
        defaults: false,
      });
    });

    it('maps --no-analytics and --no-analytics-record to opt-outs', async () => {
      mocks.loadMockServerConfig.mockResolvedValue({});

      const command = createMockServerCommand();
      await command.parseAsync(['node', 'test', '--no-analytics', '--no-analytics-record']);

      expect(mocks.resolveAnalytics).toHaveBeenCalledWith(
        process.cwd(),
        expect.objectContaining({ enabled: false, record: false, seed: [] }),
      );
      expect(mocks.defineAnalyticsMock).not.toHaveBeenCalled();
    });

    it('layers the analytics mocks after presets and before mock directories', async () => {
      mocks.loadMockServerConfig.mockResolvedValue({});
      mocks.discoverServices.mockResolvedValue([{ key: 'my-api' }]);
      mocks.resolveAnalytics.mockReturnValue(resolved);
      const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

      const command = createMockServerCommand();
      await command.parseAsync(['node', 'test']);

      const monitor = mocks.defineAnalyticsMock.mock.results[0]?.value;
      expect(mocks.defineAnalyticsMock).toHaveBeenCalledWith({
        record: resolved.record,
        seed: resolved.seed,
      });
      expect(mocks.defineAppFeatureEventsMock).toHaveBeenCalledWith({ store: monitor.store });
      expect(mocks.use.mock.calls).toEqual([
        ['fusion'],
        [[monitor, { key: 'apps', serviceDiscovery: 'merge' }]],
        [[{ key: 'my-api' }]],
      ]);
      expect(mocks.storeReady).toHaveBeenCalledBefore(mocks.start);
      expect(mocks.ensureGitIgnoredDir).toHaveBeenCalledWith('/app/.fusion-mock');
      expect(log).toHaveBeenCalledWith(
        expect.stringMatching(
          /^receiving analytics, recording to .*analytics\.jsonl, 2 seeded event\(s\) from .*recordings$/,
        ),
      );
    });

    it('does not touch Git ignores for a chosen recording file', async () => {
      mocks.loadMockServerConfig.mockResolvedValue({});
      mocks.resolveAnalytics.mockReturnValue({ ...resolved, defaultRecord: false });
      vi.spyOn(console, 'log').mockImplementation(() => undefined);

      const command = createMockServerCommand();
      await command.parseAsync(['node', 'test']);

      expect(mocks.ensureGitIgnoredDir).not.toHaveBeenCalled();
    });

    it('skips the app-feature events query without the fusion preset', async () => {
      mocks.loadMockServerConfig.mockResolvedValue({});
      mocks.resolveAnalytics.mockReturnValue({ ...resolved, record: undefined, seed: [] });
      const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

      const command = createMockServerCommand();
      await command.parseAsync(['node', 'test', '--preset', 'other']);

      expect(mocks.defineAppFeatureEventsMock).not.toHaveBeenCalled();
      expect(log).toHaveBeenCalledWith(
        expect.stringContaining('receiving analytics, kept in memory'),
      );
      expect(log).toHaveBeenCalledWith(expect.stringContaining('no app-feature events query'));
    });

    it('skips analytics with a warning when a local mock defines the monitor service', async () => {
      mocks.loadMockServerConfig.mockResolvedValue({});
      mocks.discoverServices.mockResolvedValue([{ key: 'monitor', serviceDiscovery: 'replace' }]);
      mocks.resolveAnalytics.mockReturnValue(resolved);
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

      const command = createMockServerCommand();
      await command.parseAsync(['node', 'test']);

      expect(mocks.defineAnalyticsMock).not.toHaveBeenCalled();
      expect(warn).toHaveBeenCalledWith(
        'not receiving analytics: a local mock module defines the monitor service',
      );
    });

    it('fails startup when a seed recording cannot be loaded', async () => {
      mocks.loadMockServerConfig.mockResolvedValue({});
      mocks.resolveAnalytics.mockReturnValue(resolved);
      mocks.storeReady.mockRejectedValue(new Error('ENOENT: recordings'));

      const command = createMockServerCommand();

      await expect(command.parseAsync(['node', 'test'])).rejects.toThrow(/ENOENT/);
      expect(mocks.start).not.toHaveBeenCalled();
    });
  });
});
