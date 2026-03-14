import type { ActionCreator, ActionDefinitions, ActionTypes } from './types/actions';

/**
 * A mapped type that converts {@link ActionDefinitions} into an object of
 * callable void-returning functions. Each function dispatches its corresponding
 * action to a subject when called.
 *
 * @template T - The action definitions record.
 */
export type ActionCalls<T extends ActionDefinitions> = {
  [K in keyof T]: T[K] extends ActionCreator ? (...args: Parameters<T[K]>) => void : never;
};

/**
 * Maps action definitions to callable dispatch functions bound to a subject.
 *
 * Given a record of named action creators, returns an object with the same keys
 * where each value is a function that creates the action and dispatches it
 * to the provided subject via `subject.next()`.
 *
 * Supports nested action definition objects (recursively mapped).
 *
 * @template T - The action definitions record type.
 * @param actions - A record of named action creators (or nested action definition objects).
 * @param subject - The target subject (e.g., {@link FlowSubject}) to dispatch actions to.
 * @returns An object of callable dispatch functions mirroring the action definitions.
 *
 * @example
 * ```ts
 * import { actionMapper, createAction, FlowSubject } from '@equinor/fusion-observable';
 *
 * const actions = {
 *   increment: createAction<number>('increment'),
 *   decrement: createAction<number>('decrement'),
 * };
 *
 * const subject = new FlowSubject(reducer);
 * const dispatch = actionMapper(actions, subject);
 * dispatch.increment(1); // dispatches { type: 'increment', payload: 1 }
 * ```
 */
export const actionMapper = <T extends ActionDefinitions>(
  actions: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subject: { next: (action: ActionTypes<T>) => void },
): ActionCalls<T> =>
  Object.entries(actions).reduce(
    (cur, [prop, fnOrActions]) =>
      Object.assign(cur, {
        [prop]:
          typeof fnOrActions === 'function'
            ? /** if value is a function, call it 🤙🏻 */
              (...args: unknown[]) => subject.next(fnOrActions(...args) as ActionTypes<T>)
            : /** extract child actions */
              actionMapper(fnOrActions, subject),
      }),
    {} as ActionCalls<T>,
  );

export default actionMapper;
