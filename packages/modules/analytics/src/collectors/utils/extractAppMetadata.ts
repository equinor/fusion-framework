import { z } from 'zod';
import type { AppManifest, CurrentApp } from '@equinor/fusion-framework-module-app';

/**
 * Zod schema for an object containing an optional `appKey` string.
 *
 * @remarks
 * Used by {@link AppSelectedCollector} to validate the event body.
 */
export const appKeySchema = z
  .object({
    appKey: z.string().optional(),
  })
  .optional()
  .nullable();

/**
 * Zod schema for a Fusion application metadata object.
 *
 * @remarks
 * Validates core app fields (appKey, displayName, type) and optional build
 * and category information. Used by {@link AppLoadedCollector}.
 */
export const appSchema = z
  .object({
    appKey: z.string(),
    displayName: z.string(),
    type: z.string(),
    categoryName: z.string().optional(),
    buildVersion: z.string().optional(),
    buildTag: z.string().optional().nullable(),
  })
  .optional();

/** Inferred type from {@link appKeySchema}. */
export type AppKeyType = z.infer<typeof appKeySchema>;

/** Inferred type from {@link appSchema}. */
export type AppItemType = z.infer<typeof appSchema>;

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
