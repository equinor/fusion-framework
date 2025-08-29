import { updateStorageItem } from './operators/update-storage-item.operator.js';
import { updateStorageItems } from './operators/update-storage-items.operator.js';

export const storageOperators = {
  updateStorageItem,
  updateStorageItems,
};

export { PouchDbStorage } from './PouchDbStorage.js';

export { StorageError } from './StorageError.js';

export type {
  IStorage,
  RetrieveItemsOptions,
  RetrievedItemsResponse,
} from './Storage.interface.js';

export type {
  StorageItem,
  StorageChangeEvent,
  StorageChangeEventType,
  StorageChangeEventHandler,
  StorageErrorEvent,
  StorageErrorHandler,
  StorageSuccessEvent,
  StorageResult,
} from './types.js';
