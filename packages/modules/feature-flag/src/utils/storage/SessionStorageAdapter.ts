import { StorageAdapter } from './StorageAdapter';

export class SessionStorageAdapter<TType = unknown> extends StorageAdapter<TType> {
    constructor(namespace: string) {
        super(namespace, window.sessionStorage);
    }
}

export default SessionStorageAdapter;
