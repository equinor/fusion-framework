import type { ContextItem } from '@equinor/fusion-framework-module-context';
import type { z } from 'zod';
import type { contextSchema } from './extractContextMetadata.js';

/**
 * Extracts context metadata from a `ContextItem` for analytics events.
 *
 * @param context - The Fusion context item.
 * @returns An object with id, type, and optional title, externalId, and source.
 */
export const extractContextMetadata = (context: ContextItem): z.input<typeof contextSchema> => {
  return {
    id: context.id,
    externalId: context.externalId ?? undefined,
    title: context.title ?? undefined,
    type: context.type.id,
    source: context.source ?? undefined,
  };
};
