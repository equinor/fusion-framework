export type TypeConstant = string;

/**
 * Represents an action with a type property of type `T extends TypeConstant`.
 * This type is commonly used in state management patterns like Redux to represent
 * the actions that can be dispatched to update the application state.
 */
export type Action<T extends TypeConstant = TypeConstant> = { type: T };

/**
 * An Action type which accepts any other properties.
 * This is mainly for the use of the `Reducer` type.
 * This is not part of `Action` itself to prevent types that extend `Action` from
 * having an index signature.
 */
export interface AnyAction extends Action {
  // Allows any extra properties to be defined in an action.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [extraProps: string]: any;
}

/**
 * A function that creates an action of type `T extends Action = AnyAction`.
 * The function can accept any number of arguments, which will be used to construct the action object.
 *
 * @param args - The arguments used to construct the action object.
 * @returns An action of type `T`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionCreator<T extends Action = AnyAction> = (...args: any[]) => T;

/**
 * Represents an asynchronous action creator function that can dispatch both a success and failure action.
 *
 * The `success` property is a required action creator that will be dispatched upon successful completion of the asynchronous operation.
 * The `failure` property is an optional action creator that will be dispatched if the asynchronous operation fails.
 */
export type AsyncActionCreator = ActionCreator & {
  success: ActionCreator;
  failure?: ActionCreator;
};

/**
 * Utility type that represents the possible action types for an asynchronous action creator.
 *
 * If the provided `AsyncActionCreator` type has a `failure` property that is an `ActionCreator`,
 * the resulting type will be a union of the return types of the `AsyncActionCreator`, the `success`
 * action creator, and the `failure` action creator.
 *
 * If the provided `AsyncActionCreator` type does not have a `failure` property that is an
 * `ActionCreator`, the resulting type will be a union of the return types of the `AsyncActionCreator`
 * and the `success` action creator.
 *
 * @template T - The type of the `AsyncActionCreator`.
 */
export type AsyncActionTypes<T> = T extends AsyncActionCreator
  ? T['failure'] extends ActionCreator
    ? ReturnType<T> | ReturnType<T['success']> | ReturnType<T['failure']>
    : ReturnType<T> | ReturnType<T['success']>
  : never;

/**
 * Utility type that extracts the return type of an `ActionCreator` function, or returns the input type `T` if it is already an `AnyAction`.
 * This is useful for ensuring the correct action type is used in reducers and other action-handling code.
 *
 * @template T - The action creator function or action type to extract the return type from.
 * @returns The return type of the `ActionCreator` function, or the input type `T` if it is already an `AnyAction`.
 */
export type ActionInstance<T> = T extends ActionCreator
  ? ReturnType<T>
  : T extends AnyAction
    ? T
    : never;

/**
 * Represents a map of action instances for a given set of action creators.
 *
 * @template T - The input type, which can be a record of action creators, or any other type.
 */
export type ActionInstanceMap<T> = T extends Record<string, ActionCreator>
  ? {
      [K in keyof T]: T[K] extends AsyncActionCreator
        ? AsyncActionTypes<T[K]>
        : ActionInstance<T[K]>;
      //   [K in keyof T]: ActionInstance<T[K]>;
    }
  : {
      [K in keyof T]: ActionInstanceMap<T[K]>;
    };

/**
 * Utility type that recursively extracts the `ActionTypes` from a given object type `T`.
 *
 * This type is useful for creating a union of all possible action types from a given set of actions.
 *
 * @param T - The object type to extract `ActionTypes` from.
 * @returns The union of all `ActionTypes` from the given object type `T`.
 */
export type ActionTypes<T> = T extends Record<string, ActionCreator>
  ? ActionTypes<ActionInstanceMap<T>>
  : T extends Record<string, Action>
    ? T[keyof T]
    : T extends Record<string, unknown>
      ? {
          [K in keyof T]: ActionTypes<T[K]>;
        }[keyof T]
      : never;

/**
 * An action with a string type and an associated payload. This is the
 * type of action returned by `createAction()` action creators.
 *
 * @template P The type of the action's payload.
 * @template T the type used for the action type.
 * @template M The type of the action's meta (optional)
 * @template E The type of the action's error (optional)
 *
 * @public
 */
export type PayloadAction<P = void, T extends string = string, M = never, E = never> = {
  payload: P;
  type: T;
} & ([M] extends [never]
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    {}
  : {
      meta: M;
    }) &
  ([E] extends [never]
    ? // eslint-disable-next-line @typescript-eslint/ban-types
      {}
    : {
        error: E;
      });

/**
 * Utility type that extracts the `type` property from an `Action` type.
 *
 * This type is useful when working with actions in a type-safe manner, as it allows you to
 * get the specific type of an action without having to manually extract it.
 *
 * @template T - The action type or action creator to extract the `type` from.
 * @returns The `type` property of the `Action` type, or `never` if the input type is not an `Action`.
 */
export type ActionType<T> = T extends ActionCreator
  ? ActionType<ActionInstance<T>>
  : T extends Action
    ? T['type']
    : never;

/**
 * Extracts the action name from the action type string.
 *
 * The action type string is expected to be in the format `${actionName}::${actionSuffix}`.
 * This function will return the `actionName` part of the string.
 *
 * If the action type string does not match the expected format, the entire action type string will be returned.
 *
 * @param TAction - The action type.
 * @returns The action name extracted from the action type string.
 */
export type ActionBaseType<TAction extends Action> = TAction extends Action
  ? Extract<
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      TAction['type'] extends `${infer AName}::${infer ASuffix}` ? AName : TAction['type'],
      string
    >
  : never;

/**
 * Utility type that extracts the payload type from an `ActionInstance` type.
 * If the `ActionInstance` extends `PayloadAction<any>`, the payload type is extracted.
 * Otherwise, `never` is returned.
 *
 * This is useful for working with actions that have payloads, as it allows you to
 * easily access the payload type without having to manually extract it.
 *
 * @template T - The `ActionInstance` type.
 * @returns The payload type of the `ActionInstance`, or `never` if it does not extend `PayloadAction<any>`.
 */
export type ActionPayloadType<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ActionInstance<T> extends PayloadAction<any> ? ActionInstance<T>['payload'] : never;

/**
 * Extracts an action type from a given action object type.
 *
 * This utility type is useful when you have a union of action objects, and you want to extract the action type for a specific action object.
 *
 * @template TAction - The action object type.
 * @template TType - The action type constant. If not provided, it will be inferred from the `TAction` type.
 * @returns The extracted action type.
 */
export type ExtractAction<
  TAction extends Action,
  TType extends TypeConstant = ActionType<TAction>,
> = Extract<TAction, Action<TType>>;

/**
 * Utility type to extract action with a suffix from action type.
 * The action type string is expected to be in the format `${actionName}::${actionSuffix}`.
 *
 * @template TAction - The action type to check.
 * @template Suffix - The required suffix for the action type.
 * @returns The original action type if it has the required suffix, or `never` if it does not.
 */
export type ActionWithSuffix<TAction extends Action, Suffix extends string> = TAction extends Action
  ? // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TAction['type'] extends `${infer AName}::${infer ASuffix}`
    ? ASuffix extends Suffix
      ? TAction
      : never
    : never
  : never;

export type ActionDefinitions = Record<string, ActionCreator>;
