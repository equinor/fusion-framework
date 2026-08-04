import { z } from 'zod';

import type { IStorage } from './storage/Storage.interface.js';

/** Zod schema for the state module storage interface. */
const IStorageSchema = z.object({
  initialize: z.function().optional(),
  clear: z.function().optional(),
  item: z.function(),
  allItems: z.function(),
  putItem: z.function(),
  putItems: z.function().optional(),
  removeItem: z.function(),
  removeItems: z.function().optional(),
  // `events$` is an Observable property, not a callable - just require it to be present.
  events$: z.custom((value) => value != null),
  [Symbol.dispose]: z.function(),
});

/** Zod schema for the state module configuration object. */
export const StateModuleConfigSchema = z.object({
  storage: IStorageSchema.describe(
    'Storage implementation for state module. Must implement the IStorage interface.',
  ),
});

export type StateModuleConfigStorage = IStorage;
