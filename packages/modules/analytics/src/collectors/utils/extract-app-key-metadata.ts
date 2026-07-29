import type { CurrentApp } from '@equinor/fusion-framework-module-app';
import type { z } from 'zod';
import type { appKeySchema } from './app-key-schema.js';

/**
 * Extracts app-key metadata from a `CurrentApp` instance.
 *
 * @param app - The current app object.
 * @returns An object containing the optional `appKey`.
 */
export const extractAppKeyMetadata = (app: CurrentApp): z.input<typeof appKeySchema> => {
  return {
    appKey: app?.appKey,
  };
};
