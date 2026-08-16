import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import type { IHttpClient } from '@equinor/fusion-framework-module-http';

import { AppClient } from '../AppClient.js';
import { AppConfig } from '../AppConfig.js';
import { MockAppClient } from '../mock/MockAppClient.js';
import type { AppManifest } from '../types.js';

const manifest: AppManifest = {
  appKey: 'my-app',
  displayName: 'My App',
  description: 'My app',
  type: 'standalone',
  build: { version: '1.2.3', entryPoint: 'index.js' },
};

const config = new AppConfig({ environment: { key: 'value' } });

// never invoked directly -- both overrides either answer locally or delegate through
// the spied `AppClient.prototype` methods below, so the real client is never called
const client = {} as IHttpClient;

describe('MockAppClient', () => {
  describe('getAppManifest', () => {
    it('answers locally for its own app key with no tag', async () => {
      const mockClient = new MockAppClient(client, manifest);

      const result = mockClient.getAppManifest({ appKey: 'my-app' });

      await expect(firstValueFrom(result)).resolves.toBe(manifest);
    });

    it('delegates for its own app key with an explicit empty-string tag', () => {
      const delegate = vi
        .spyOn(AppClient.prototype, 'getAppManifest')
        .mockReturnValue(of(manifest));
      const mockClient = new MockAppClient(client, manifest);

      mockClient.getAppManifest({ appKey: 'my-app', tag: '' });

      expect(delegate).toHaveBeenCalledWith({ appKey: 'my-app', tag: '' });
      delegate.mockRestore();
    });

    it('delegates for a different app key', () => {
      const delegate = vi
        .spyOn(AppClient.prototype, 'getAppManifest')
        .mockReturnValue(of(manifest));
      const mockClient = new MockAppClient(client, manifest);

      mockClient.getAppManifest({ appKey: 'other-app' });

      expect(delegate).toHaveBeenCalledWith({ appKey: 'other-app' });
      delegate.mockRestore();
    });
  });

  describe('getAppConfig', () => {
    it('answers locally for its own app key with no tag', async () => {
      const mockClient = new MockAppClient(client, manifest, config);

      const result = mockClient.getAppConfig({ appKey: 'my-app' });

      await expect(firstValueFrom(result)).resolves.toBe(config);
    });

    it("answers locally for its own app key with a tag matching the manifest's build version", async () => {
      const mockClient = new MockAppClient(client, manifest, config);

      const result = mockClient.getAppConfig({ appKey: 'my-app', tag: '1.2.3' });

      await expect(firstValueFrom(result)).resolves.toBe(config);
    });

    it('delegates for its own app key with an explicit empty-string tag', () => {
      const delegate = vi.spyOn(AppClient.prototype, 'getAppConfig').mockReturnValue(of(config));
      const mockClient = new MockAppClient(client, manifest, config);

      mockClient.getAppConfig({ appKey: 'my-app', tag: '' });

      expect(delegate).toHaveBeenCalledWith({ appKey: 'my-app', tag: '' });
      delegate.mockRestore();
    });

    it('delegates for its own app key with a tag not matching the manifest build version', () => {
      const delegate = vi.spyOn(AppClient.prototype, 'getAppConfig').mockReturnValue(of(config));
      const mockClient = new MockAppClient(client, manifest, config);

      mockClient.getAppConfig({ appKey: 'my-app', tag: '9.9.9' });

      expect(delegate).toHaveBeenCalledWith({ appKey: 'my-app', tag: '9.9.9' });
      delegate.mockRestore();
    });
  });
});
