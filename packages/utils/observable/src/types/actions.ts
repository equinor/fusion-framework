export type TypeConstant = string;

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionCreator<T extends Action = AnyAction> = (...args: any[]) => T;

export type AsyncActionCreator = ActionCreator & {
    success: ActionCreator;
    failure?: ActionCreator;
};

export type AsyncActionTypes<T> = T extends AsyncActionCreator
    ? T['failure'] extends ActionCreator
        ? ReturnType<T> | ReturnType<T['success']> | ReturnType<T['failure']>
        : ReturnType<T> | ReturnType<T['success']>
    : never;

export type ActionInstance<T> = T extends ActionCreator
    ? ReturnType<T>
    : T extends AnyAction
    ? T
    : never;

// export type ActionInstanceMap<T> = { [K in keyof T]: ActionInstance<T[K]> };

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

// export type ActionTypes<T> = T extends Record<string, Record<string, ActionCreator>>
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

export type ActionType<T> = T extends ActionCreator
    ? ActionType<ActionInstance<T>>
    : T extends Action
    ? T['type']
    : never;

export type ActionPayloadType<T> =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ActionInstance<T> extends PayloadAction<any> ? ActionInstance<T>['payload'] : never;

export type ExtractAction<
    TAction extends Action,
    TType extends TypeConstant = ActionType<TAction>,
> = Extract<TAction, Action<TType>>;

export type ActionDefinitions = Record<string, ActionCreator>;
