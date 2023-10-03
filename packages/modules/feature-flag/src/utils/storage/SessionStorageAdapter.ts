import { StorageAdapter } from './StorageAdapter';

export class SessionStorageAdapter<TType = unknown> extends StorageAdapter<TType> {
    constructor(namespace: string, name: string) {
        super(namespace, name, window.sessionStorage);
    }
}

export default SessionStorageAdapter;
