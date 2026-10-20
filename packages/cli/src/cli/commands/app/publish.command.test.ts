import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  initializeFramework: vi.fn(),
  bundleApp: vi.fn(),
  uploadApplication: vi.fn(),
  tagApplication: vi.fn(),
  checkApp: vi.fn(),
  generateApplicationConfig: vi.fn(),
  publishAppConfig: vi.fn(),
  log: {
    start: vi.fn(),
    succeed: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Retain real environment utilities while replacing CLI collaborators with test doubles.
vi.mock('@equinor/fusion-framework-cli/bin', async () => ({
  ...(await import('../../../bin/fusion-env.js')),
  ...mocks,
  resolveDefaultEnv: () => 'ci',
  ConsoleLogger: class {
    start = mocks.log.start;
    succeed = mocks.log.succeed;
    debug = mocks.log.debug;
    info = mocks.log.info;
    error = mocks.log.error;
  },
}));

/**
 * Loads a fresh Commander instance so options cannot leak between publish invocations.
 * @param args - Publish arguments after the controlled environment and authentication options.
 * @param token - Whether to supply a controlled static token instead of service-principal options.
 * @returns Completion of the publish command.
 */
async function publish(args: string[], token = true): Promise<void> {
  vi.resetModules();
  const { command } = await import('./publish.command.js');
  // Compose a stable CI invocation before appending each test's command arguments.
  await command.parseAsync(
    ['--env', 'ci', ...(token ? ['--token', 'controlled-token'] : []), ...args],
    { from: 'user' },
  );
}

describe('app publish existing-version recovery', () => {
  const identity = { appKey: 'bundle-app', version: '19.2.0+8421b01' };
  const framework = { controlled: 'framework' };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('FUSION_TOKEN', undefined);
    mocks.checkApp.mockResolvedValue(true);
    mocks.initializeFramework.mockResolvedValue(framework);
    mocks.bundleApp.mockResolvedValue({ archive: 'built.bundle.zip' });
    mocks.uploadApplication.mockResolvedValue(identity);
    mocks.tagApplication.mockResolvedValue({});
    mocks.generateApplicationConfig.mockResolvedValue({ config: { controlled: true } });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('keeps existing-version recovery disabled by default', async () => {
    await publish(['provided.bundle.zip']);

    expect(mocks.uploadApplication).toHaveBeenCalledExactlyOnceWith({
      log: mocks.log,
      framework,
      fileOrBundle: 'provided.bundle.zip',
      allowExistingVersion: false,
    });
    expect(mocks.tagApplication).toHaveBeenCalledExactlyOnceWith({
      log: mocks.log,
      framework,
      ...identity,
      tag: 'latest',
    });
    expect(mocks.log.info).not.toHaveBeenCalledWith(expect.stringContaining('was re-tagged'));
  });

  it.each([
    { tag: 'latest', version: '19.2.0+8421b01' },
    { tag: 'latest', version: '18.0.0+older-commit' },
    { tag: 'pr-42', version: '19.2.0+8421b01' },
  ])(
    're-tags $tag for $version and completes requested config publication',
    async ({ tag, version }) => {
      mocks.uploadApplication.mockResolvedValue({ ...identity, version, existingVersion: true });

      await publish([
        '--allow-existing-version',
        '--tag',
        tag,
        '--config',
        'app.config.ci.ts',
        'provided.bundle.zip',
      ]);

      expect(mocks.initializeFramework).toHaveBeenCalledExactlyOnceWith({
        env: 'ci',
        auth: { token: 'controlled-token', tenantId: undefined, clientId: undefined },
      });
      expect(mocks.uploadApplication).toHaveBeenCalledExactlyOnceWith({
        log: mocks.log,
        framework,
        fileOrBundle: 'provided.bundle.zip',
        allowExistingVersion: true,
      });
      expect(mocks.bundleApp).not.toHaveBeenCalled();
      expect(mocks.tagApplication).toHaveBeenCalledExactlyOnceWith({
        log: mocks.log,
        framework,
        appKey: identity.appKey,
        version,
        tag,
      });
      expect(mocks.generateApplicationConfig).toHaveBeenCalledWith({
        log: mocks.log,
        config: 'app.config.ci.ts',
      });
      expect(mocks.publishAppConfig).toHaveBeenCalledWith({
        log: mocks.log,
        framework,
        config: { controlled: true },
        appKey: identity.appKey,
        buildVersion: version,
      });
      expect(mocks.log.info).toHaveBeenLastCalledWith(
        `Existing application version bundle-app@${version} was re-tagged "${tag}" in environment "ci".`,
      );
      expect(mocks.log.info.mock.invocationCallOrder.at(-1)).toBeGreaterThan(
        mocks.publishAppConfig.mock.invocationCallOrder[0],
      );
      expect(mocks.log.succeed).not.toHaveBeenCalledWith('🚀 Upload completed');
    },
  );

  it('builds source only once and uses the returned resolved snapshot identity', async () => {
    const version = '19.2.0-pr-42.1234567';
    mocks.uploadApplication.mockResolvedValue({ ...identity, version, existingVersion: true });

    await publish(['--allow-existing-version', '--snapshot', 'pr-42', '--tag', 'pr-42']);

    expect(mocks.bundleApp).toHaveBeenCalledExactlyOnceWith({
      log: mocks.log,
      manifest: undefined,
      snapshot: 'pr-42',
    });
    expect(mocks.uploadApplication).toHaveBeenCalledExactlyOnceWith({
      log: mocks.log,
      framework,
      fileOrBundle: 'built.bundle.zip',
      allowExistingVersion: true,
    });
    expect(mocks.tagApplication).toHaveBeenCalledWith(
      expect.objectContaining({ version, tag: 'pr-42' }),
    );
  });

  it('preserves ordinary successful publishing when opted in', async () => {
    await publish(['--allow-existing-version', 'provided.bundle.zip']);

    expect(mocks.log.succeed).toHaveBeenCalledWith('🚀 Upload completed');
    expect(mocks.log.info).not.toHaveBeenCalledWith(expect.stringContaining('was re-tagged'));
  });

  it('retains the selected environment and service-principal authentication during recovery', async () => {
    const tenantId = '11111111-1111-4111-8111-111111111111';
    const clientId = '22222222-2222-4222-8222-222222222222';
    mocks.uploadApplication.mockResolvedValue({ ...identity, existingVersion: true });

    await publish(
      [
        '--env',
        'fqa',
        '--tenantId',
        tenantId,
        '--clientId',
        clientId,
        '--allow-existing-version',
        'provided.bundle.zip',
      ],
      false,
    );

    expect(mocks.initializeFramework).toHaveBeenCalledExactlyOnceWith({
      env: 'fqa',
      auth: { token: undefined, tenantId, clientId },
    });
    expect(mocks.tagApplication).toHaveBeenCalledExactlyOnceWith({
      log: mocks.log,
      framework,
      ...identity,
      tag: 'latest',
    });
    expect(mocks.log.info).toHaveBeenLastCalledWith(
      `Existing application version bundle-app@${identity.version} was re-tagged "latest" in environment "fqa".`,
    );
  });

  it.each([
    'initializeFramework',
    'uploadApplication',
    'tagApplication',
    'publishAppConfig',
  ] as const)('fails without a recovery-success notice when %s fails', async (operation) => {
    mocks.uploadApplication.mockResolvedValue({ ...identity, existingVersion: true });
    mocks[operation].mockRejectedValue(new Error('Controlled failure'));
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit(1)');
    });
    try {
      await expect(
        publish([
          '--allow-existing-version',
          '--config',
          'app.config.ci.ts',
          'provided.bundle.zip',
        ]),
      ).rejects.toThrow(
        operation === 'initializeFramework' ? 'Controlled failure' : 'process.exit(1)',
      );
      expect(mocks.log.info).not.toHaveBeenCalledWith(expect.stringContaining('was re-tagged'));
      // Initialization and upload failures occur before tagging can begin.
      if (operation === 'initializeFramework' || operation === 'uploadApplication') {
        expect(mocks.tagApplication).not.toHaveBeenCalled();
      }
      // Config publication is skipped only when that operation itself failed.
      if (operation !== 'publishAppConfig') {
        expect(mocks.publishAppConfig).not.toHaveBeenCalled();
      }
    } finally {
      exit.mockRestore();
    }
  });
});
