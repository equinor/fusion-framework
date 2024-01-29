import { StorageAdapter, type IStorageAdapter } from './StorageAdapter';

import { LocalStorageAdapter } from './LocalStorageAdapter';
import { SessionStorageAdapter } from './SessionStorageAdapter';

export { type IStorageAdapter, StorageAdapter, LocalStorageAdapter, SessionStorageAdapter };

export type StorageType = 'local' | 'session';

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
