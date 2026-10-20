import AdmZip from 'adm-zip';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { fetch, createClient } = vi.hoisted(() => ({
  fetch: vi.fn(),
  createClient: vi.fn(),
}));

vi.mock('./initialize-framework.js', () => ({
  initializeFramework: vi.fn(async () => ({ serviceDiscovery: { createClient } })),
}));

vi.mock('./utils/index.js', () => ({
  defaultHeaders: {},
  formatAuthError: vi.fn(),
  formatTokenAcquisitionError: vi.fn(),
  ConsoleLogger: class {
    info = vi.fn();
    debug = vi.fn();
    warn = vi.fn();
    error = vi.fn();
    fail = vi.fn();
    succeed = vi.fn();
  },
}));

import { initializeFramework } from './initialize-framework.js';
import { FusionEnv } from './fusion-env.js';
import { uploadApplication } from './upload-application.js';
import { ConsoleLogger } from './utils/index.js';

const version = '19.2.0+8421b01';
const frameworkSettings = {
  env: FusionEnv.ContinuesIntegration,
  auth: { token: 'controlled-token' },
};
const duplicate = {
  status: 409,
  error: {
    code: 'ConflictError',
    resourceIdentifier: 'version',
    message: `An app build with version ${version} already exists`,
  },
};

/**
 * Builds an in-memory artifact whose metadata version deliberately differs from its authoritative manifest.
 * @param manifest - Bundle manifest content used to exercise recovery validation.
 * @returns The controlled application archive.
 */
function bundle(manifest: unknown = { version }): AdmZip {
  const archive = new AdmZip();
  archive.addFile(
    'metadata.json',
    Buffer.from(JSON.stringify({ appKey: 'bundle-app', name: 'different-name', version: '0.0.0' })),
  );
  archive.addFile('app-manifest.json', Buffer.from(JSON.stringify(manifest)));
  return archive;
}

describe('uploadApplication existing-version contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createClient.mockResolvedValue({ fetch, request$: { subscribe: vi.fn() } });
    fetch.mockResolvedValue(Response.json(duplicate, { status: 409 }));
    vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit(1)');
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([undefined, false])(
    'fails duplicate uploads with allowExistingVersion=%s',
    async (allowExistingVersion) => {
      const framework = await initializeFramework(frameworkSettings);

      await expect(
        uploadApplication({
          framework,
          fileOrBundle: bundle(),
          allowExistingVersion,
        }),
      ).rejects.toThrow('process.exit(1)');
      expect(process.exit).toHaveBeenCalledWith(1);
      expect(fetch).toHaveBeenCalledTimes(1);
    },
  );

  it('returns the exact manifest version and app key for an opted-in structured duplicate', async () => {
    const framework = await initializeFramework(frameworkSettings);
    const log = new ConsoleLogger('test');

    await expect(
      uploadApplication({
        framework,
        log,
        fileOrBundle: bundle(),
        allowExistingVersion: true,
      }),
    ).resolves.toEqual({ appKey: 'bundle-app', version, existingVersion: true });
    expect(createClient).toHaveBeenCalledWith('apps');
    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      '/bundles/apps/bundle-app',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(Blob),
      }),
    );
    expect(log.succeed).not.toHaveBeenCalled();
    expect(process.exit).not.toHaveBeenCalled();
  });

  it('preserves an explicit upload app key and the service-normalized version', async () => {
    const framework = await initializeFramework(frameworkSettings);

    await expect(
      uploadApplication({
        framework,
        fileOrBundle: bundle({ version: '19.2.0+8421B01' }),
        appKey: 'explicit-app',
        allowExistingVersion: true,
      }),
    ).resolves.toEqual({ appKey: 'explicit-app', version, existingVersion: true });
    expect(fetch).toHaveBeenCalledWith('/bundles/apps/explicit-app', expect.anything());
  });

  it.each([undefined, false, true])(
    'keeps successful upload results unchanged with opt-in=%s',
    async (allowExistingVersion) => {
      const framework = await initializeFramework(frameworkSettings);
      fetch.mockResolvedValue(Response.json({ version: 'service-resolved-version' }));
      const archive = bundle();
      archive.deleteFile('app-manifest.json');

      await expect(
        uploadApplication({
          framework,
          fileOrBundle: archive,
          allowExistingVersion,
        }),
      ).resolves.toEqual({ appKey: 'bundle-app', version: 'service-resolved-version' });
    },
  );

  it.each([
    { name: 'unknown resource', error: { ...duplicate.error, resourceIdentifier: 'app' } },
    {
      name: 'missing resource',
      error: { code: duplicate.error.code, message: duplicate.error.message },
    },
    { name: 'different code', error: { ...duplicate.error, code: 'OtherConflict' } },
    {
      name: 'another version',
      error: { ...duplicate.error, message: 'An app build with version 1.0.0 already exists' },
    },
    {
      name: 'unrelated message',
      error: { ...duplicate.error, message: 'A different conflict occurred' },
    },
    { name: 'null error', error: null },
    { name: 'array error', error: [] },
  ])('does not recover $name', async ({ error }) => {
    const framework = await initializeFramework(frameworkSettings);
    fetch.mockResolvedValue(Response.json({ error }, { status: 409 }));

    await expect(
      uploadApplication({
        framework,
        fileOrBundle: bundle(),
        allowExistingVersion: true,
      }),
    ).rejects.toThrow('process.exit(1)');
  });

  it.each([400, 401, 403, 404, 410, 500])(
    'does not recover HTTP %s even with duplicate-shaped JSON',
    async (status) => {
      const framework = await initializeFramework(frameworkSettings);
      fetch.mockResolvedValue(Response.json(duplicate, { status }));

      await expect(
        uploadApplication({
          framework,
          fileOrBundle: bundle(),
          allowExistingVersion: true,
        }),
      ).rejects.toThrow('process.exit(1)');
    },
  );

  it('does not recover an unstructured conflict', async () => {
    const framework = await initializeFramework(frameworkSettings);
    fetch.mockResolvedValue(new Response('Conflict', { status: 409 }));

    await expect(
      uploadApplication({
        framework,
        fileOrBundle: bundle(),
        allowExistingVersion: true,
      }),
    ).rejects.toThrow('process.exit(1)');
  });

  it.each([
    { name: 'missing version', manifest: {} },
    { name: 'invalid version', manifest: { version: 'not-a-version' } },
    { name: 'non-string version', manifest: { version: 123 } },
  ])('fails recovery for $name', async ({ manifest }) => {
    const framework = await initializeFramework(frameworkSettings);

    await expect(
      uploadApplication({
        framework,
        fileOrBundle: bundle(manifest),
        allowExistingVersion: true,
      }),
    ).rejects.toThrow('process.exit(1)');
  });

  it('fails recovery when the bundle manifest is missing', async () => {
    const framework = await initializeFramework(frameworkSettings);
    const archive = bundle();
    archive.deleteFile('app-manifest.json');

    await expect(
      uploadApplication({
        framework,
        fileOrBundle: archive,
        allowExistingVersion: true,
      }),
    ).rejects.toThrow('process.exit(1)');
  });

  it.each(['discovery', 'network'])('fails closed on %s errors', async (failure) => {
    const framework = await initializeFramework(frameworkSettings);
    // Inject failures at the selected boundary to verify recovery never masks them.
    if (failure === 'discovery') createClient.mockRejectedValue(new Error('Discovery failed'));
    else fetch.mockRejectedValue(new Error('Network failed'));

    await expect(
      uploadApplication({
        framework,
        fileOrBundle: bundle(),
        allowExistingVersion: true,
      }),
    ).rejects.toThrow('process.exit(1)');
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
