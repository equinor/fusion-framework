import { type ActionTypes, createAction } from '@equinor/fusion-observable/actions';

export const profileActions = {
  updateName: createAction('PROFILE__UPDATE_NAME', (name: string) => ({
    payload: name,
    metadata: { timestamp: new Date().toISOString() },
  })),
  updateEmail: createAction('PROFILE__UPDATE_EMAIL', (email: string) => ({
    payload: email,
    metadata: { timestamp: new Date().toISOString() },
  })),
  toggleTheme: createAction('PROFILE__TOGGLE_THEME', () => ({
    payload: undefined,
    metadata: { timestamp: new Date().toISOString() },
  })),
  toggleEmailNotifications: createAction('PROFILE__TOGGLE_EMAIL_NOTIFICATIONS', () => ({
    payload: undefined,
    metadata: { timestamp: new Date().toISOString() },
  })),
  togglePushNotifications: createAction('PROFILE__TOGGLE_PUSH_NOTIFICATIONS', () => ({
    payload: undefined,
    metadata: { timestamp: new Date().toISOString() },
  })),
  updateLanguage: createAction(
    'PROFILE__UPDATE_LANGUAGE',
    (language: 'en' | 'no' | 'da' | 'sv') => ({
      payload: language,
      metadata: { timestamp: new Date().toISOString() },
    }),
  ),
  resetProfile: createAction('PROFILE__RESET_PROFILE', () => ({
    payload: undefined,
    metadata: { timestamp: new Date().toISOString() },
  })),
};

export type ProfileAction = ActionTypes<typeof profileActions>;

export default profileActions;
