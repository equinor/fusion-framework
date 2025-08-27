/**
 * Type definitions for the State Replication Cookbook
 */

export type SyncStatus = 'online' | 'offline' | 'syncing' | 'error';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
  lastModified: string;
};

export type UserPreferences = {
  theme: 'light' | 'dark';
  language: 'en' | 'no' | 'da' | 'sv';
  notifications: {
    email: boolean;
    push: boolean;
  };
};

export type ReplicationSettings = {
  url: string;
  username?: string;
  password?: string;
  live: boolean;
  retry: boolean;
};
