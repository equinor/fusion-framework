import { z } from 'zod';
import type { AppManifest, CurrentApp } from '@equinor/fusion-framework-module-app';

// Schema representing an object with key appKey and a string value.
// Used to parse an object containing appKey.
export const appKeySchema = z
  .object({
    appKey: z.string().optional(),
  })
  .optional()
  .nullable();

// Schema representing an object with data points of an app.
// Used to parse an object with app data.
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

export type AppKeyType = z.infer<typeof appKeySchema>;

export type AppItemType = z.infer<typeof appSchema>;

export const extractAppKeyMetadata = (app: CurrentApp): z.input<typeof appKeySchema> => {
  return {
    appKey: app?.appKey,
  };
};

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
