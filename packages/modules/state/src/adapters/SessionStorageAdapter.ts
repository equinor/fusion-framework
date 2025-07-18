import type { ObservableInput } from 'rxjs';
import { StorageAdapter } from './StorageAdapter';
import type { AllowedValue, IStateItem } from '../StateItem';

export class SessionStorageAdapter<TType extends AllowedValue> extends StorageAdapter<TType> {
  constructor(namespace: string) {
    super(namespace, window.sessionStorage);
  }

  get initial(): ObservableInput<IStateItem[]> {
    return Object.values(this.getItems());
  }
}

export default SessionStorageAdapter;
