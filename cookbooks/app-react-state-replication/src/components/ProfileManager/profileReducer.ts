/* eslint-disable @typescript-eslint/no-explicit-any */
import { createReducer } from '@equinor/fusion-observable';
import { profileActions } from './profileActions';
import type { UserProfile } from '../../types';

const defaultProfile: UserProfile = {
  id: 'user-001',
  name: 'Anonymous User',
  email: 'anonymous@example.com',
  preferences: {
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: false,
    },
  },
  lastModified: new Date().toISOString(),
} as const;

/**
 * Example of how to create a reducer using @equinor/fusion-observable
 *
 * This uses the builder pattern with .addCase() for each action type.
 * When possible, prefer this approach over manual switch statements.
 */
export const createProfileReducer = (initialState: UserProfile = defaultProfile) => {
  return createReducer(initialState, (builder) => {
    // Note: Currently using string types due to TypeScript compilation issues
    // In a real implementation, you would use the action creators directly
    builder
      .addCase(profileActions.resetProfile, () => initialState)
      .addCase(profileActions.updateName, (state, action) => {
        state.name = action.payload;
      })
      .addCase(profileActions.updateEmail, (state, action) => {
        state.email = action.payload;
      })
      .addCase(profileActions.toggleTheme, (state) => {
        state.preferences.theme = state.preferences.theme === 'light' ? 'dark' : 'light';
      })
      .addCase(profileActions.toggleEmailNotifications, (state) => {
        state.preferences.notifications.email = !state.preferences.notifications.email;
      })
      .addCase(profileActions.togglePushNotifications, (state) => {
        state.preferences.notifications.push = !state.preferences.notifications.push;
      })
      .addCase(profileActions.updateLanguage, (state, action) => {
        state.preferences.language = action.payload;
      })
      .addMatcher(
        () => true,
        (state) => {
          const now = new Date().toISOString();
          state.lastModified = now;
        },
      );
  });
};
