import { createAction, createAsyncAction } from '@equinor/fusion-observable/actions';
import type { ActionTypes } from '@equinor/fusion-observable/actions';
import { v7 as generateId } from 'uuid';
import type { To, NavigateOptions, NavigationBlocker, NavigationUpdate } from '../types';

/**
 * Action for navigating to a new location (push or replace).
 */
const navigateAction = createAsyncAction(
  'navigation/navigate',
  (to: To, options: NavigateOptions) => ({
    payload: { to, options },
    meta: { key: generateId() },
  }),
  (update: NavigationUpdate) => ({
    payload: { update },
  }),
  (error: Error) => ({
    payload: { error },
  }),
);

const abortNavigateAction = createAction('navigation/navigate::abort', (reason?: string) => ({
  payload: { reason },
}));

/**
 * Action for navigating backward or forward in history.
 */
const goDeltaAction = createAsyncAction(
  'navigation/go',
  (delta: number) => ({
    payload: { delta },
  }),
  (update: NavigationUpdate) => ({
    payload: { update },
  }),
  (error: Error) => ({
    payload: { error },
  }),
);

/**
 * Action for handling browser back/forward navigation (popstate events).
 */
const popStateAction = createAsyncAction(
  'navigation/pop',
  (update?: NavigationUpdate) => ({
    payload: { update },
  }),
  (update: NavigationUpdate) => ({
    payload: { update },
  }),
  (error: Error) => ({
    payload: { error },
  }),
);

/**
 * Action for validating the current location against history state.
 */
const validateLocationAction = createAsyncAction(
  'navigation/navigationValidation',
  () => ({
    payload: {},
  }),
  (update: NavigationUpdate) => ({
    payload: { update },
  }),
  (error: Error) => ({
    payload: { error },
  }),
);

/**
 * Action for adding a navigation blocker.
 */
const addBlockerAction = createAction('navigation/addBlocker', (blocker: NavigationBlocker) => ({
  payload: { blocker },
}));

/**
 * Action for removing a navigation blocker.
 */
const removeBlockerAction = createAction(
  'navigation/removeBlocker',
  (blocker: NavigationBlocker) => ({
    payload: { blocker },
  }),
);

/**
 * Navigation actions for history state management.
 */
export const actions = {
  navigate: navigateAction,
  abortNavigate: abortNavigateAction,
  go: goDeltaAction,
  pop: popStateAction,
  validateLocation: validateLocationAction,
  addBlocker: addBlockerAction,
  removeBlocker: removeBlockerAction,
};

/**
 * Union type of all navigation actions.
 */
export type Actions = ActionTypes<typeof actions>;
