import { StorageAdapter, type IStorageAdapter } from './StorageAdapter';

import { LocalStorageAdapter } from './LocalStorageAdapter';
import { SessionStorageAdapter } from './SessionStorageAdapter';
import type { AllowedValue } from '../StateItem';

export { type IStorageAdapter, StorageAdapter, LocalStorageAdapter, SessionStorageAdapter };

export type StorageType = 'local' | 'session';

export const createStorage = <TType extends AllowedValue = AllowedValue>(
  namespace: string,
  type: StorageType,
): IStorageAdapter<TType> => {
  switch (type) {
    case 'local':
      return new LocalStorageAdapter(namespace);
    case 'session':
      return new SessionStorageAdapter(namespace);
    default:
      throw Error('invalid type provided');
  }
};

export default createStorage;
