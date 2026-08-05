import { describe, expect, it, vi, beforeEach, afterEach, type MockInstance } from 'vitest';

import { BASE_URL } from './setup';

import { AppStateApiClient, ApiVersion } from '../src/app-state';

import { HttpClient } from '@equinor/fusion-framework-module-http/client';

describe('AppState', () => {
  let httpClient: HttpClient;
  let httpClientWatcher: MockInstance;
  let appStateClient: AppStateApiClient;

  beforeEach(() => {
    httpClient = new HttpClient(BASE_URL, {
      /* options */
    });
    httpClientWatcher = vi.spyOn(httpClient, 'json');
    appStateClient = new AppStateApiClient(httpClient, 'json');
  });

  afterEach(() => {
    httpClientWatcher.mockRestore();
  });

  describe('listMyApps', () => {
    it('requests the current user apps endpoint', async () => {
      const result = await appStateClient.listMyApps('v1');

      expect(result).toMatchObject([{ appKey: 'my-app' }]);
      expect(httpClientWatcher).toHaveBeenCalledWith(
        `/persons/me/apps?api-version=${ApiVersion.v1}`,
        expect.objectContaining({ selector: expect.any(Function) }),
      );
    });
  });

  describe('getMyAppState', () => {
    it('requests the current user state for a single app', async () => {
      const result = await appStateClient.getMyAppState('v1', { appKey: 'my-app' });

      expect(result).toMatchObject({ appKey: 'my-app' });
      expect(httpClientWatcher).toHaveBeenCalledWith(
        `/persons/me/apps/my-app?api-version=${ApiVersion.v1}`,
        expect.objectContaining({ selector: expect.any(Function) }),
      );
    });
  });

  describe('wipeMyAppState', () => {
    it('sends a DELETE request for a single app', async () => {
      await appStateClient.wipeMyAppState('v1', { appKey: 'my-app' });

      expect(httpClientWatcher).toHaveBeenCalledWith(
        `/persons/me/apps/my-app?api-version=${ApiVersion.v1}`,
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('wipeAllMyState', () => {
    it('sends the required X-Confirm-Wipe header', async () => {
      const result = await appStateClient.wipeAllMyState('v1');

      expect(result).toMatchObject({ wiped: true });
      expect(httpClientWatcher).toHaveBeenCalledWith(
        `/persons/me?api-version=${ApiVersion.v1}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'X-Confirm-Wipe': 'true' },
        }),
      );
    });
  });

  describe('listAppUsers', () => {
    it('requests the users with state for an app', async () => {
      const result = await appStateClient.listAppUsers('v1', { appKey: 'my-app' });

      expect(result).toEqual(['user-oid-1', 'user-oid-2']);
      expect(httpClientWatcher).toHaveBeenCalledWith(
        `/admin/apps/my-app/users?api-version=${ApiVersion.v1}`,
        expect.objectContaining({ selector: expect.any(Function) }),
      );
    });
  });

  describe('getUserAppState', () => {
    it('requests a single user state for an app', async () => {
      const result = await appStateClient.getUserAppState('v1', {
        appKey: 'my-app',
        userId: 'user-1',
      });

      expect(result).toMatchObject({ userId: 'user-1' });
      expect(httpClientWatcher).toHaveBeenCalledWith(
        `/admin/apps/my-app/users/user-1?api-version=${ApiVersion.v1}`,
        expect.objectContaining({ selector: expect.any(Function) }),
      );
    });
  });

  describe('wipeUserAppState', () => {
    it('sends a DELETE request for a single user', async () => {
      await appStateClient.wipeUserAppState('v1', { appKey: 'my-app', userId: 'user-1' });

      expect(httpClientWatcher).toHaveBeenCalledWith(
        `/admin/apps/my-app/users/user-1?api-version=${ApiVersion.v1}`,
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('wipeAllAppUsersState', () => {
    it('sends the required X-Confirm-Wipe header', async () => {
      const result = await appStateClient.wipeAllAppUsersState('v1', { appKey: 'my-app' });

      expect(result).toMatchObject({ wiped: true });
      expect(httpClientWatcher).toHaveBeenCalledWith(
        `/admin/apps/my-app?api-version=${ApiVersion.v1}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'X-Confirm-Wipe': 'true' },
        }),
      );
    });

    it('rejects when the API rejects a missing confirmation header', async () => {
      // Simulate the upstream API rejecting the request when the confirmation header is stripped
      await expect(
        appStateClient.wipeAllAppUsersState(
          'v1',
          { appKey: 'my-app' },
          { headers: {} as unknown as HeadersInit },
        ),
      ).rejects.toBeTruthy();
    });
  });
});
