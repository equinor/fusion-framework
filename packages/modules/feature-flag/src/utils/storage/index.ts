import { StorageAdapter, type IStorageAdapter } from './StorageAdapter';

import { LocalStorageAdapter } from './LocalStorageAdapter';
import { SessionStorageAdapter } from './SessionStorageAdapter';

export { type IStorageAdapter, StorageAdapter, LocalStorageAdapter, SessionStorageAdapter };

/** Discriminator for selecting the browser storage backend. */
export type StorageType = 'local' | 'session';

/**
 * Factory that creates the appropriate {@link StorageAdapter} for the
 * requested storage type.
 *
 * @template TType - The type of values stored.
 * @param namespace - Prefix used to scope keys in the underlying storage.
 * @param type - `'local'` for `localStorage`, `'session'` for `sessionStorage`.
 * @returns A configured {@link StorageAdapter} instance.
 * @throws If an unsupported `type` is provided.
 */
export const createStorage = <TType = unknown>(
  namespace: string,
  type: StorageType,
): StorageAdapter<TType> => {
  switch (type) {
    case 'local':
      return new LocalStorageAdapter(namespace);
    case 'session':
      return new SessionStorageAdapter(namespace);
  }
  throw Error('invalid type provided');
};

export default createStorage;
