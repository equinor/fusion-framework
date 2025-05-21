import {
  DataProtectionScope,
  Environment,
  PersistenceCreator,
  PersistenceCachePlugin,
  type IPersistence,
} from '@azure/msal-node-extensions';

import { tmpdir } from 'node:os';

import path from 'node:path';

/**
 * Resolves the directory path for storing the authentication cache.
 *
 * Uses the user's root directory if available, otherwise falls back to the OS temp directory.
 *
 * @returns The resolved cache directory path as a string.
 */
const resolveCachePath = () => {
  return Environment?.getUserRootDirectory() ?? tmpdir();
};

/**
 * Resolves the file path for the authentication cache based on tenant and client IDs.
 *
 * @param tenantId - The Azure AD tenant ID.
 * @param clientId - The Azure AD client/application ID.
 * @returns The full file path for the cache file.
 */
const resolveCacheFilePath = (tenantId: string, clientId: string) => {
  return path.join(resolveCachePath(), `.token-cache-${tenantId}_${clientId}`);
};

/**
 * Creates a persistence cache for storing authentication data securely on disk.
 *
 * The cache is encrypted and scoped to the current user for security. It is uniquely identified
 * by the provided tenant and client IDs, and is associated with the 'fusion-framework' service.
 *
 * @param tenantId - The Azure AD tenant ID used to identify the cache.
 * @param clientId - The Azure AD client/application ID used to identify the cache.
 * @returns A promise that resolves to the created persistence cache instance.
 */
export const createPersistenceCache = async (
  tenantId: string,
  clientId: string,
): Promise<IPersistence> => {
  return PersistenceCreator.createPersistence({
    cachePath: resolveCacheFilePath(tenantId, clientId),
    serviceName: 'fusion-framework',
    accountName: [tenantId, clientId].join('_'),
    dataProtectionScope: DataProtectionScope.CurrentUser,
  });
};

/**
 * Clears the persistence cache for a specific tenant and client.
 *
 * Deletes the cache file and all associated authentication data for the given tenant and client IDs.
 *
 * @param tenantId - The Azure AD tenant ID.
 * @param clientId - The Azure AD client/application ID.
 * @returns A promise that resolves when the cache has been successfully cleared.
 */
export const clearPersistenceCache = async (tenantId: string, clientId: string): Promise<void> => {
  const cache = await createPersistenceCache(tenantId, clientId);
  await cache.delete();
};

/**
 * Creates a `PersistenceCachePlugin` instance for use with MSAL, using the provided tenant and client IDs.
 *
 * This plugin enables MSAL to use the secure persistence cache for token storage.
 *
 * @param tenantId - The Azure AD tenant ID.
 * @param clientId - The Azure AD client/application ID.
 * @returns A promise that resolves to an instance of `PersistenceCachePlugin`.
 */
export const createPersistenceCachePlugin = async (
  tenantId: string,
  clientId: string,
): Promise<PersistenceCachePlugin> => {
  return new PersistenceCachePlugin(await createPersistenceCache(tenantId, clientId));
};
