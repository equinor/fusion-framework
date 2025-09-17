import type { ILogger, LogLevel } from '@equinor/fusion-log';
import type { IEventModuleProvider } from '@equinor/fusion-framework-module-event';
import type { IBookmarkProvider } from './BookmarkProvider.interface';
import type { IBookmarkClient } from './BookmarkClient.interface';

/**
 * Represents the source system for a bookmark.
 */
export interface SourceSystem {
  /** Unique identifier for the source system */
  identifier: string;
  /** Human-readable name of the source system */
  name?: string | null;
  /** Sub-system identifier */
  subSystem?: string | null;
}

/**
 * Represents the data associated with a bookmark.
 * This is a generic type that can hold any arbitrary data as a key-value map.
 */
export type BookmarkData = Record<string, unknown> | string;

/**
 * Represents a user associated with a bookmark.
 */
export interface BookmarkUser {
  /** Unique identifier for the user */
  id: string;
  /** Display name of the user */
  name: string;
  /** Email address of the user */
  mail?: string;
}

/**
 * Represents the context associated with a bookmark.
 */
export interface BookmarkContext {
  /** Unique identifier for the context */
  id: string;
  /** Human-readable name of the context */
  name?: string;
  /** Type of the context */
  type?: string;
}

/**
 * Represents a bookmark without any associated data.
 */
export interface BookmarkWithoutData {
  /** Unique identifier for the bookmark */
  id: string;
  /** Name of the bookmark */
  name: string;
  /** Application key this bookmark belongs to */
  appKey: string;
  /** Optional description of the bookmark */
  description?: string;
  /** Whether the bookmark is shared */
  isShared?: boolean;
  /** When the bookmark was created */
  created: Date;
  /** User who created the bookmark */
  createdBy: BookmarkUser;
  /** When the bookmark was last updated */
  updated?: Date;
  /** User who last updated the bookmark */
  updatedBy?: BookmarkUser;
  /** Context associated with the bookmark */
  context?: BookmarkContext;
  /** Source system information */
  sourceSystem?: SourceSystem | null;
}

/**
 * Represents a bookmark with associated data.
 * @template T - The type of the bookmark data.
 */
// biome-ignore lint/suspicious/noExplicitAny: must be any to support all bookmark data types
export interface Bookmark<T extends BookmarkData = any> extends BookmarkWithoutData {
  /** Optional payload data associated with the bookmark */
  payload?: T;
}

/**
 * Represents a collection of bookmarks.
 */
export type Bookmarks = BookmarkWithoutData[];

/**
 * Represents the configuration options for a bookmark module.
 */
export interface BookmarkModuleConfig {
  /** Optional logger instance */
  log?: ILogger;
  /** Optional log level */
  logLevel?: LogLevel;
  /** Optional event provider for handling events */
  eventProvider?: IEventModuleProvider;
  /** The source system for the bookmarks */
  sourceSystem?: SourceSystem;
  /** Parent Bookmark provider */
  parent?: IBookmarkProvider | null;
  /** API client for interacting with bookmarks */
  client: IBookmarkClient;
  /** Functions for resolving context and application */
  resolve: {
    /** Function to resolve the current context */
    context: () => Promise<{ id: string } | undefined>;
    /** Function to resolve the current application */
    application: () => Promise<{ appKey: string; name?: string } | undefined>;
  };
  /** Flags for enabling resolving when fetching bookmarks */
  filters?: {
    /** Whether to filter by context */
    context?: boolean;
    /** Whether to filter by application */
    application?: boolean;
  };
}
