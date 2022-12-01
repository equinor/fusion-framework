import { ActionCreator, ActionDefinitions, AnyAction } from './types/actions';

/** flat map ActionDefinitions  */
type ActionCalls<T extends ActionDefinitions> = {
    [K in keyof T]: T[K] extends ActionCreator ? (...args: Parameters<T[K]>) => void : never;
};

/**
 * Maps action definitions to a subject {@link FlowSubject}
 *
 * @param actions - object of named action
 * @param subject - target subject to map actions to
 * @returns object of callable action which maps to provided subject
 */
export const actionMapper = <T extends ActionDefinitions>(
    actions: T,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subject: { next: (action: AnyAction) => void }
): ActionCalls<T> =>
    Object.entries(actions).reduce(
        (cur, [prop, fnOrActions]) =>
            Object.assign(cur, {
                [prop]:
                    typeof fnOrActions === 'function'
                        ? /** if value is a function, call it 🤙🏻 */
                          (...args: unknown[]) => subject.next(fnOrActions(...args))
                        : /** extract child actions */
                          actionMapper(fnOrActions, subject),
            }),
        {} as ActionCalls<T>
    );

export default actionMapper;
