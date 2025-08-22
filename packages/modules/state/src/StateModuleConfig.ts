import { z } from 'zod';
import type { IStorage } from './storage/Storage.interface.js';

/**
 * Zod schema for the IStorage interface.
 *
 * @see {@link IStorage} - `@equinor/fusion-framework-module-state/storage`
 */
export const IStorageSchema = z.object({
  // Optional methods
  initialize: z
    .function()
    .describe('Function to initialize the storage. Signature: initialize() => Promise<void>')
    .optional(),

  clear: z
    .function()
    .describe(
      'Function to clear items from storage. Signature: clear(args?: { clear_all: boolean }) => Promise<StorageResult[]>',
    )
    .optional(),

  // Required methods
  item: z
    .function()
    .describe(
      'Function to get a single item by key. Signature: item<T>(key: string) => Promise<StorageItem<T> | null>',
    ),

  allItems: z
    .function()
    .describe(
      'Function to get all items. Signature: allItems<T>(options?: RetrieveItemsOptions) => Promise<RetrievedItemsResponse<T>>',
    ),

  putItem: z
    .function()
    .describe(
      'Function to store a single item. Signature: putItem(item: StorageItem) => Promise<StorageResult>',
    ),

  putItems: z
    .function()
    .describe(
      'Function to store multiple items. Signature: putItems(items: StorageItem[]) => Promise<StorageResult[]>',
    )
    .optional(),

  removeItem: z
    .function()
    .describe(
      'Function to remove a single item. Signature: removeItem(item: Pick<StorageItem, "key">) => Promise<StorageResult>',
    ),

  removeItems: z
    .function()
    .describe(
      'Function to remove multiple items. Signature: removeItems(items: Pick<StorageItem, "key">[]) => Promise<StorageResult[]>',
    )
    .optional(),

  events$: z
    .function()
    .describe(
      'Function to get observable stream of storage events. Signature: events$() => Observable<StorageEvent>',
    ),

  // Disposable interface
  [Symbol.dispose]: z
    .function()
    .describe('Dispose function from Disposable interface. Signature: [Symbol.dispose]() => void'),
});

/**
 * Zod schema for the state module config object.
 */
export const StateModuleConfigSchema = z.object({
  /**
   * Storage implementation for state module. Must implement the IStorage interface.
   * @see {@link IStorage}
   */
  storage: IStorageSchema.describe(
    'Storage implementation for state module. Must implement the IStorage interface.',
  ),
});

/**
 * Configuration options for the StateModule.
 *
 * @property storage - An implementation of the IStorage interface used for persisting state.
 */
export interface StateModuleConfig {
  storage: IStorage;
}

/**
 * Validates whether the provided configuration object conforms to the `StateModuleConfig` schema.
 *
 * @param config - The configuration object to validate.
 * @returns `true` if the configuration is a valid `StateModuleConfig`, otherwise `false`.
 */
export const validateStateModuleConfig = (config: unknown): config is StateModuleConfig => {
  return StateModuleConfigSchema.safeParse(config).success;
};
