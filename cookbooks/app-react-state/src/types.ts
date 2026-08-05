/**
 * Shared type definitions for the cookbook's Profile example. Sync status types don't live here -
 * they come from the framework itself, see `useStateSyncEvents` and `StateSyncEventType`.
 */

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
