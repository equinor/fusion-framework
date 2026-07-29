import type { AppManifest } from '@equinor/fusion-framework-module-app';
import type { z } from 'zod';
import type { appSchema } from './app-schema.js';

/**
 * Extracts detailed app metadata from an `AppManifest` for analytics events.
 *
 * @param app - The application manifest.
 * @returns An object with appKey, displayName, type, and optional build/category info.
 */
export const extractAppMetadata = (app: AppManifest): z.input<typeof appSchema> => {
  return {
    appKey: app.appKey,
    displayName: app.displayName,
    type: app.type,
    categoryName: app.category?.name,
    buildVersion: app.build?.version,
    buildTag: app.build?.tag,
  };
};
