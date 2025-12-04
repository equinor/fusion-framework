import { z } from 'zod';
import type { AppManifest, CurrentApp } from '@equinor/fusion-framework-module-app';

export const appKeySchema = z
  .object({
    appKey: z.string().optional(),
  })
  .optional()
  .nullable();

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
