import { z } from 'zod';

import { LogLevel, type ILogger } from '@equinor/fusion-log';

import type { IEventModuleProvider } from '@equinor/fusion-framework-module-event';

import type { BookmarkProvider } from './BookmarkProvider';
import type { IBookmarkClient } from './BookmarkClient.interface';

import { bookmarkSourceSystemSchema } from './bookmark.schemas';

export const bookmarkConfigSchema = z.object({
    log: z.custom<ILogger>().optional(),
    logLevel: z.nativeEnum(LogLevel).optional(),
    eventProvider: z.custom<IEventModuleProvider>().optional(),
    sourceSystem: bookmarkSourceSystemSchema
        .optional()
        .describe('The source system for the bookmarks'),
    parent: z.custom<BookmarkProvider>().describe('Parent Bookmark provider').optional().nullable(),
    client: z.custom<IBookmarkClient>().describe('API client for interacting with bookmarks'),
    resolve: z
        .object({
            context: z.function().returns(z.promise(z.object({ id: z.string() }).optional())),
            application: z
                .function()
                .returns(
                    z.promise(
                        z.object({ appKey: z.string(), name: z.string().optional() }).optional(),
                    ),
                ),
        })
        .describe('Functions for resolving context and application'),
    filters: z
        .object({
            context: z.boolean().optional().default(false),
            application: z.boolean().optional().default(false),
        })
        .describe('Flags for enabling resolving when fetching bookmarks')
        .optional()
        .default({ context: false, application: false }),
});
